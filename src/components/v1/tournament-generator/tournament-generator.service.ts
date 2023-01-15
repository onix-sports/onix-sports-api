import { GamesService } from '@components/v1/games/games.service';
import { UserEntity } from '@components/v1/users/schemas/user.schema';
import { UsersService } from '@components/v1/users/users.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { Tournament } from '@components/v1/tournaments/schemas/tournament.schema';
import { TournamentService } from '@components/v1/tournaments/tournament.service';
import { Reflector } from '@nestjs/core';
import UsersRepository from '../users/users.repository';
import { GameInfo } from '../games/core/interfaces/game-info.interface';
import { StatisticsService } from '../statistics/services/statistics.service';
import { tournamentGeneratorConstants } from './tournament-generator.constants';
import { TournamentSchema } from './interfaces/tournament-schema.interface';
import { FourPlayersTournament } from './tournaments/4-players.tournament';
import { FivePlayersTournament } from './tournaments/5-players.tournament';
import { SixPlayersTournament } from './tournaments/6-players.tournament';
import { EightPlayersTournament } from './tournaments/8-players.tournament';
import { TenPlayersTournament } from './tournaments/10-players.tournament';
import { TournamentType } from '../tournaments/enum/tour-type.enum';
import { setTimeout } from 'timers/promises';

@Injectable()
export class TournamentGenerator {
    constructor(
    private readonly gameService: GamesService,
    private readonly tournamentService: TournamentService,
    private readonly statisticsService: StatisticsService,
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly reflector: Reflector,
    ) {
        this.registerTournaments();
    }

    private plans: {[key: number]: any} = {};

    private tournaments: any[] = [
        FourPlayersTournament,
        FivePlayersTournament,
        SixPlayersTournament,
        EightPlayersTournament,
        TenPlayersTournament,
    ];

    private registerTournaments() {
        this.tournaments.forEach((Tournament: any) => {
            const schema = this.reflector.get<TournamentSchema>(tournamentGeneratorConstants.metadata.tournamentSchema, Tournament);
            const type = this.reflector.get<TournamentSchema>(tournamentGeneratorConstants.metadata.tournamentType, Tournament);

            const instance = new Tournament(
                this.statisticsService,
            );

            this.plans[schema.players] = {
                type,
                generate: (players: UserEntity[]) => {
                    return {
                        type,
                        games: schema.games.map((game: number[]) => ({
                            players: game.map((index: number) => players[index]),
                        })),
                        teams: schema.teams
                            ? schema.teams.map((team: number[]) => team.map((index: number) => players[index]))
                            : [],
                    };
                },
                onGameFinished: instance.onGameFinished?.bind?.(instance),
            };
        });
    }

    private getPlan(count: number): any {
        if (count < 4) {
            throw new BadRequestException('Not enough players');
        }

        return this.plans[count]?.generate || this.getPlan(count - 1);
    }

    private async checkPlayers(ids: ObjectId[]) {
        const _ids = ids.map((id) => id.toString());

        if (_ids.length !== new Set(_ids).size) {
            throw new BadRequestException('Players must be unique');
        }

        return this.userRepository
            .get({ _id: { $in: ids } })
            .then((foundPlayers: UserEntity[]) => {
                ids.forEach((id) => {
                    const ids = foundPlayers.map(({ _id }: UserEntity) => _id.toString());

                    if (!ids.includes(id.toString())) {
                        throw new NotFoundException(`Player with id ${id} was not found`);
                    }
                });
            });
    }

    private shuffle<T>(values: T[]) {
        return values
            .map((a) => ({ sort: Math.random(), value: a }))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => a.value);
    }

    public async generate(ids: ObjectId[], _title?: string) {
        await this.checkPlayers(ids);

        const gamesPlan = this.getPlan(ids.length);

        let tournament: (Tournament & Document & Document<any, any>) | null = await this.tournamentService.create({ title: _title });

        const players = await Promise.all(ids.map((id: ObjectId) => this.userService.getUser(id))) as UserEntity[];
        const shuffled = this.shuffle<UserEntity>(players);
        const { type, games: _games, teams }: any = gamesPlan(shuffled);

        const games = await this.generateGames(_games, tournament?._id);

        await tournament.update({ type });

        tournament = await this.tournamentService.getOne(tournament._id);

        await this.eventEmitter.emitAsync('tournament.generated', {
            games, tournament, teams, players: shuffled,
        });

        return { games, tournament, teams };
    }

    private async generateGames(games: any[], tournament: ObjectId) {
        const _games = games.map((game: any) => ({
            ...game,
            players: game.players.map((player: any) => player._id.toString()),
            tournament,
        }));

        return this.gameService.createGames(_games, { _id: 1, name: 1 });
    }

    @OnEvent('game.finished.after')
    private async onGameFinished({ info }: { id: string, info: GameInfo }) {
        if (!info.tournament) return;

        const tournament = await this.tournamentService.getOne(info.tournament);

        if (!tournament) {
            throw new NotFoundException(`Tournament with id ${info.tournament} was not found`);
        }

        const handler = Object.values(this.plans).find((plan: any) => plan.type === tournament.type)?.onGameFinished;

        if (!handler || tournament.type === TournamentType.CUSTOM) return;

        const playersIndexes = tournament.players.reduce((acc: { [key: string]: number }, player: ObjectId, index: number) => {
            acc[player.toString()] = index;

            return acc;
        }, {});

        // For some reason, sometimes statistics are not ready yet (ONLY FOR 10 PLAYERS TOURNAMENT). @TOOD: investigate and fix
        await setTimeout(3000);

        const stats = await this.statisticsService.getTournamentStats(tournament._id);
        const games = await handler(info, playersIndexes, stats)
            .then((games: number[][]) => {
                return games.map((game: number[]) => ({
                    players: game.map((index: number) => ({ _id: tournament.players[index] })),
                }));
            });

        if (games.length === 0) return;

        await this.generateGames(games, tournament._id);
    }
}
