import { GameEntity } from '@components/v1/games/schemas/game.schema';
import { Injectable } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { StatisticsService } from '@components/v1/statistics/services/statistics.service';
import { ObjectId } from 'mongodb';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentStatus } from './enum/tour-status.enum';
import { TournamentRepository } from './tournament.repository';
import { Poll, TelegramData } from './schemas/tournament.schema';
import { TournamentType } from './enum/tour-type.enum';

@Injectable()
export class TournamentService {
    constructor(
        private readonly statisticsService: StatisticsService,
        private readonly tournamentRepository: TournamentRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    create(tournament: CreateTournamentDto) {
        return this.tournamentRepository.create(tournament);
    }

    getMany(query: any) {
        return this.tournamentRepository.getAll(query);
    }

    getOne(id: ObjectId) {
        return this.tournamentRepository.getById(id);
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

    async closeTournament(id: ObjectId) {
        const performance = await this.statisticsService.getTournamentPerform(id);

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

        await this.eventEmitter.emitAsync('tournament.closed', { performance, tournament });

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
}
