import { StringObjectId } from '@components/common/types/string-objectid.type';
import { GameEntity } from '@components/games/schemas/game.schema';
import { Injectable } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { StatisticsService } from '@components/statistics/services/statistics.service';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentStatus } from './enum/tour-status.enum';
import { TournamentRepository } from './tournament.repository';
import { Poll, TelegramData } from './schemas/tournament.schema';

@Injectable()
export class TournamentService {
    constructor(
    private readonly statisticsService: StatisticsService,
    private readonly tournamentRepository: TournamentRepository,
    private readonly eventEmitter: EventEmitter2,
    ) {}

    create(tournament: CreateTournamentDto) {
        return this.tournamentRepository.create(tournament);
    }

    getMany(query: any) {
        return this.tournamentRepository.getAll(query);
    }

    getOne(id: StringObjectId) {
        return this.tournamentRepository.getById(id);
    }

  @OnEvent('games.created', { async: true })
    async pushGames({ games }: { games: GameEntity[] }) {
        const _games = Array.isArray(games) ? games : [games];
        const promises = _games.map(({ tournament, _id, players }) => this.tournamentRepository.updateOne({
            _id: tournament,
            status: TournamentStatus.OPENED,
        }, {
            $push: { games: _id },
            $addToSet: { players: players.map(({ _id }: any) => _id) },
        }));

        await Promise.all(promises);
    }

  async closeTournament(id: ObjectId) {
      const performance = await this.statisticsService.getTournamentPerform(id);
      const [tournament] = await Promise.all([
          this.tournamentRepository.updateById(id, { $set: { status: TournamentStatus.CLOSED, best: new Types.ObjectId(performance.goals[0]._id) } }),
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
}
