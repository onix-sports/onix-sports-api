import { GameEntity } from '@components/v1/games/schemas/game.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { StatisticsService } from '@components/v1/statistics/services/statistics.service';
import { ObjectId } from 'mongodb';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentStatus } from './enum/tour-status.enum';
import { TournamentRepository } from './tournament.repository';
import { Poll, TelegramData } from './schemas/tournament.schema';
import { TournamentType } from './enum/tour-type.enum';
import GamesRepository from '../games/games.repository';

@Injectable()
export class TournamentService {
    constructor(
        private readonly statisticsService: StatisticsService,
        private readonly tournamentRepository: TournamentRepository,
        private readonly gamesRepository: GamesRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    create(tournament: CreateTournamentDto, creator: ObjectId) {
        return this.tournamentRepository.create({ ...tournament, creator, moderator: creator });
    }

    getMany(query: any) {
        return this.tournamentRepository.getAll(query);
    }

    getOne(id: ObjectId) {
        return this.tournamentRepository.getById(id);
    }

    async getTournamentsByOrganizations(ids: ObjectId[], organizations: ObjectId[]) {
        const [tournament] = await this.tournamentRepository.getTournamentByOrganizations(ids, organizations);

        if (!tournament) {
            throw new NotFoundException('Tournament not found!');
        }

        return tournament;
    }

    @OnEvent('tournaments.find')
    find({ tournaments }: { tournaments: ObjectId[] }) {
        return this.tournamentRepository.get({ _id: { $in: tournaments } });
    }

    @OnEvent('games.created', { async: true })
    async pushGames({ games }: { games: GameEntity[] }) {
        const _games = Array.isArray(games) ? games : [games];

        const promises = _games.map(({ tournament, _id, players }) => this.tournamentRepository.updateOne({
            _id: tournament,
            status: TournamentStatus.OPENED,
        }, {
            $push: { games: _id },
            $addToSet: { players: { $each: players.map(({ _id }: any) => _id) } },
        }));

        await Promise.all(promises);
    }

    async removeGame(id: ObjectId, gameId: ObjectId) {
        const tournament = await this.tournamentRepository.removeGame(id, gameId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        const players = (tournament.games as any as GameEntity[])
            .map(({ players }) => players.map((_id: ObjectId) => _id.toString()))
            .flat();

        const uniquePlayers = [...new Set(players)].map((_id: string) => new ObjectId(_id));

        tournament.players = uniquePlayers;

        return tournament.save();
    }

    async closeTournament(id: ObjectId, creator: ObjectId) {
        const tournamentFound = await this.tournamentRepository.getTournamentByCreator(id, creator);

        if (!tournamentFound) {
            throw new NotFoundException('Tournament not found!');
        }

        const performance = await this.statisticsService.getTournamentPerform(id);

        this.eventEmitter.emitAsync('tournament.closed', { performance, tournamentId: id });

        if (performance.goals.length === 0) {
            return this.tournamentRepository.deleteById(id).then(() => ({
                message: 'Tournament was deleted because of no played games',
            }));
        }

        const [tournament] = await Promise.all([
            this.tournamentRepository.updateById(
                id,
                { $set: { status: TournamentStatus.CLOSED, best: new ObjectId(performance.goals[0]._id) } },
            ),
            this.statisticsService.updateTournamentStat(performance.goals[0]._id, true),
        ]);

        return tournament;
    }

    setTelegramData(id: ObjectId, telegram: TelegramData) {
        return this.tournamentRepository.updateById(id, { $set: { telegram } });
    }

    createPoll(id: ObjectId, poll: Poll) {
        return this.tournamentRepository.updateById(id, { $set: { poll } });
    }

    votePoll(pollId: string, user: ObjectId, answer: number) {
        return this.tournamentRepository.updateOne({ 'poll.id': pollId }, { $push: { [`poll.results.${answer}`]: user } });
    }

    setRespected(id: ObjectId, user: ObjectId | null) {
        return this.tournamentRepository.updateById(id, { $set: { respected: user, 'poll.closed': true } });
    }

    getRespectedCount(user: ObjectId) {
        return this.tournamentRepository.countDocuments({ respected: user });
    }

    makeCustom(id: ObjectId) {
        return this.tournamentRepository.updateById(id, { $set: { type: TournamentType.CUSTOM } });
    }

    @OnEvent('tournament.game.created', { async: true })
    async handleGameCreate({ tournament }: { tournament: ObjectId }) {
        await this.makeCustom(tournament);
    }

    async changeModerator(tournament: ObjectId, currentModerator: ObjectId, moderator: ObjectId) {
        const result = await this.tournamentRepository.changeModerator(tournament, currentModerator, moderator);

        if (!result.matchedCount) {
            throw new NotFoundException('Tournament not found!');
        }

        await this.gamesRepository.changeModerator(tournament, moderator);
    }
}
