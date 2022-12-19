import { GamesService } from '@components/v1/games/games.service';
import { UserEntity } from '@components/v1/users/schemas/user.schema';
import { UsersService } from '@components/v1/users/users.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { Tournament } from '@components/v1/tournaments/schemas/tournament.schema';
import { TournamentService } from '@components/v1/tournaments/tournament.service';
import { fourPlayersTournament } from './helpers/4-players.helper';
import { fivePlayersTournament } from './helpers/5-players.helper';
import { sixPlayersTournament } from './helpers/6-players.helper';
import { eightPlayersTournament } from './helpers/8-players.helper';
import { shuffle } from './helpers/shuffle.helper';
import UsersRepository from '../users/users.repository';

@Injectable()
export class TournamentGenerator {
    constructor(
    private readonly gameService: GamesService,
    private readonly tournamentService: TournamentService,
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,

    private readonly eventEmitter: EventEmitter2,
    ) {}

    private plans: {[key: number]: any} = {
        4: fourPlayersTournament,
        5: fivePlayersTournament,
        6: sixPlayersTournament,
        8: eightPlayersTournament,
    };

    private getPlan(count: number): any {
        return this.plans[count] || this.getPlan(count - 1);
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

    public async generate(ids: ObjectId[], _title?: string) {
        await this.checkPlayers(ids);

        const gamesPlan = this.getPlan(ids.length);

        let tournament: (Tournament & Document & Document<any, any>) | null = await this.tournamentService.create({ title: _title });

        const players = await Promise.all(ids.map((id: ObjectId) => this.userService.getUser(id)));
        const shuffled = shuffle<UserEntity | any>(players);
        const { type, games: _games, teams }: any = gamesPlan(shuffled, tournament._id);
        const __games = _games.map((game: any) => ({
            ...game,
            players: game.players.map((player: any) => player._id.toString()),
        }));

        const games = await this.gameService.createGames(__games, { _id: 1, name: 1 });

        await tournament.update({ type });

        tournament = await this.tournamentService.getOne(tournament._id);

        await this.eventEmitter.emitAsync('tournament.generated', {
            games, tournament, teams, players: shuffled,
        });

        return { games, tournament, teams };
    }
}
