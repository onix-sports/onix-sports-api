import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import { OrganizationsRepository } from '../organizations/repositories/organizations.repository';
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
        private readonly organizationRepository: OrganizationsRepository,

        private readonly eventEmitter: EventEmitter2,
    ) { }

    private checkOrganizations = async (_games: CreateGamesDto[] | CreateGamesDto) => {
        const gamesWithOrganization = [_games].flat().filter(({ organization }) => organization);
        const organizations = gamesWithOrganization.map(({ organization }) => organization!);
        const foundOrganizations = await this.organizationRepository.getMany(organizations);

        gamesWithOrganization.forEach((game) => {
            const found = foundOrganizations.some(({ _id }) => _id.equals(game.organization));

            if (!found) {
                throw new NotFoundException(`Organization with id ${game.organization!.toString()} was not found`);
            }
        });

        return _games;
    };

    private checkTournaments = async (_games: CreateGamesDto[] | CreateGamesDto) => {
        const gamesWithTournamnents = [_games].flat().filter(({ tournament }) => tournament);
        const tournaments = gamesWithTournamnents.map(({ tournament }) => tournament!);

        // eventEmmiter is needed to avoid circular dependency. @TODO: find a better solution
        const [foundTournaments] = await this.eventEmitter.emitAsync('tournaments.find', { tournaments });

        tournaments.forEach((id: ObjectId) => {
            const ids = foundTournaments.map(({ _id }: TournamentDocument) => _id.toString());

            if (!ids.includes(id.toString())) {
                throw new NotFoundException(`Tournament with id ${id} was not found`);
            }
        });

        return [_games].flat().map((game: CreateGamesDto) => ({
            ...game,
            organization: game.organization ? game.organization : foundTournaments.find(({ _id }: any) => _id.equals(game.tournament))!.organization,
        }));
    };

    private checkPlayers = (moderator: ObjectId) => async (_games: CreateGamesDto[] | CreateGamesDto) => {
        const games = [_games]
            .flat()
            .map(({ players }) => ({ players }));

        const promises = games.map(({ players }) => {
            const ids = players.map((id: ObjectId) => id.toString());

            if (ids.length !== new Set(ids).size) {
                throw new BadRequestException('Players must be unique');
            }

            const idsWithModerator = [...ids, moderator.toString()];

            return this.usersRepository
                .get({ _id: { $in: idsWithModerator } })
                .then((foundPlayers: UserEntity[]) => {
                    idsWithModerator.forEach((id) => {
                        const ids = foundPlayers.map(({ _id }: UserEntity) => _id.toString());

                        if (!ids.includes(id.toString())) {
                            throw new NotFoundException(`Player with id ${id} was not found`);
                        }
                    });
                });
        });

        return Promise.all(promises).then(() => _games);
    };

    public async createGames(_games: CreateGamesDto[] | CreateGamesDto, moderator: ObjectId, select?: any) {
        await this
            .checkOrganizations(_games)
            .then(this.checkTournaments)
            .then(this.checkPlayers(moderator));

        const gamesToCreate = [_games].flat().map((game: CreateGamesDto) => ({ ...game, moderator }));
        const games = await this.gamesRepository.create(gamesToCreate, select);

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
