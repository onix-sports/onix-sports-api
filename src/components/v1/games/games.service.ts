import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import { TournamentDocument } from '../tournaments/schemas/tournament.schema';
import { UserEntity } from '../users/schemas/user.schema';
import UsersRepository from '../users/users.repository';
import CreateGamesDto from './dto/create-game.dto';
import GamesRepository from './games.repository';
import { GameEntity } from './schemas/game.schema';

@Injectable()
export class GamesService {
    constructor(
        private readonly gamesRepository: GamesRepository,
        private readonly usersRepository: UsersRepository,

        private readonly eventEmitter: EventEmitter2,
    ) { }

    private async checkTournaments(_games: CreateGamesDto[] | CreateGamesDto) {
        const tournaments = [_games]
            .flat()
            .filter(({ tournament }) => tournament)
            .map(({ tournament }) => tournament!);

        // eventEmmiter is needed to avoid circular dependency. @TODO: find a better solution
        const [foundTournaments] = await this.eventEmitter.emitAsync('tournaments.find', { tournaments });

        tournaments.forEach((id: ObjectId) => {
            const ids = foundTournaments.map(({ _id }: TournamentDocument) => _id.toString());

            if (!ids.includes(id.toString())) {
                throw new NotFoundException(`Tournament with id ${id} was not found`);
            }
        });
    }

    private async checkPlayers(_games: CreateGamesDto[] | CreateGamesDto) {
        const games = [_games]
            .flat()
            .map(({ players }) => ({ players }));

        const promises = games.map(({ players }) => {
            const ids = players.map((id: ObjectId) => id.toString());

            if (ids.length !== new Set(ids).size) {
                throw new BadRequestException('Players must be unique');
            }

            return this.usersRepository
                .get({ _id: { $in: ids } })
                .then((foundPlayers: UserEntity[]) => {
                    ids.forEach((id) => {
                        const ids = foundPlayers.map(({ _id }: UserEntity) => _id.toString());

                        if (!ids.includes(id.toString())) {
                            throw new NotFoundException(`Player with id ${id} was not found`);
                        }
                    });
                });
        });

        return Promise.all(promises);
    }

    public async createGames(_games: CreateGamesDto[] | CreateGamesDto, select?: any) {
        await this.checkTournaments(_games);
        await this.checkPlayers(_games);

        const games = await this.gamesRepository.create(_games, select);

        await this.eventEmitter.emitAsync('games.created', { games });

        return games;
    }

    public getGameInfo(id: ObjectId) {
        return this.gamesRepository.getGameInfo(id);
    }

    public getGames(query: FilterQuery<GameEntity>, limit: number = 0, skip: number = 0, sort: any = {}) {
        const _query: any = {};

        Object.keys(query).forEach((key) => {
            if (query[key] !== undefined) {
                _query[key] = query[key];
            }
        });

        return this.gamesRepository.getGames(_query, limit, skip, sort);
    }

    public pushStats(id: ObjectId, stats: ObjectId[]) {
        return this.gamesRepository.updateById(id, { stats });
    }

    public pushActions(id: ObjectId, actions: ObjectId[]) {
        return this.gamesRepository.updateById(id, { actions });
    }

    @OnEvent('tournament.closed')
    private cleanTournamentGames({ tournamentId }: { tournamentId: ObjectId }) {
        return this.gamesRepository.deleteNotFinished(tournamentId);
    }
}
