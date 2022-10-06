import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import statisticsConstants from './statistics-constants';
import { StatisticEntity } from './schemas/statistic.schema';
import CreateStatsDto from './dto/create-stats.dto';
import { statsAggregationPipe } from './helpers/stats-aggregation.helper';
import { lastGamesAggregationPipe } from './helpers/last-games-pipe.helper';
import { TournamentConstants } from '@components/tournaments/tournament.constants';
import { TournamentDocument } from '@components/tournaments/schemas/tournament.schema';

@Injectable()
export default class StatisticsRepository {
  constructor(
    @InjectModel(statisticsConstants.models.statistics) 
    private readonly statisticModel: Model<StatisticEntity>,
    @InjectModel(TournamentConstants.models.tournaments)
    private readonly tournamentModel: Model<TournamentDocument>,
  ) {}

  create(stats: CreateStatsDto[]) {
    return this.statisticModel.create(stats);
  }

  public async getStatsPeriod(ids: ObjectId[] = [], dateFrom: Date = new Date(0), dateTo: Date = new Date(Date.now())) {
    const pipe: any = [{
      $match: {
        createdAt: { 
          $gte: dateFrom,
          $lte: dateTo,
        },
      }
    }];

    return this.aggregateStats(ids, pipe);
  }

  public async getTournament(tournament: ObjectId) {
    const pipe: any = [{ $match: { tournament } }];

    return this.aggregateStats([], pipe);
  }

  public getLastGames(ids: ObjectId[], count: Number) {
    return this.aggregateStats(ids, lastGamesAggregationPipe(count));
  }

  private async aggregateStats(ids: ObjectId[], pipe: any[] = []) {
    const $match: any = {};

    if (ids && ids.length) {
      $match.user = { $in: ids } ;
    }
    
    return this.statisticModel.aggregate([
      { $match },
      ...pipe,
      ...statsAggregationPipe(),
    ]);
  }

  public getEnemies(user: ObjectId, enemies: ObjectId[], games: Number) {
    const pipe = [
      {
        $match: { 
          user,
          enemy: {
            $in: enemies,
          }, 
        },
      },
      ...lastGamesAggregationPipe(games),
    ];

    return this.aggregateStats([], pipe);
  }

  public getTeammates(user: ObjectId, teammates: ObjectId[], games: Number) {
    const pipe = [
      {
        $match: { 
          user,
          teammate: {
            $in: teammates,
          }, 
        },
      },
      ...lastGamesAggregationPipe(games),
    ];

    return this.aggregateStats([], pipe);
  }

  public getTeammateVersusEnemies(user: ObjectId, teammate: ObjectId, enemies: ObjectId[], games: Number) {
    const pipe = [
      {
        $match: { 
          user,
          teammate,
          enemy: {
            $in: enemies,
          },
        },
      },
      ...lastGamesAggregationPipe(games),
    ];

    return this.aggregateStats([], pipe);
  }

  public getTeamsStats(team1:any[], team2: any[], games: Number) {
    const pipe = [
      {
        $match: { 
          user: team1[0]._id,
          teammate: team1[1]._id,
          enemy: [team2[0]._id, team2[1]._id],
        },
      },
      ...lastGamesAggregationPipe(games),
    ];

    return this.aggregateStats([], pipe);
  }

  public async getProfileStats(id: ObjectId) {
    const [stats] = await this.statisticModel.aggregate([
      { $match: { user: id } },
      {
        $group: {
          _id: "$user",
          goals: {
            $sum: { $add: ["$mGoals", "$rGoals"] },
          },
          mGoals: {
            $sum: "$mGoals",
          },
          rGoals: {
            $sum: "$rGoals",
          },
          aGoals: {
            $sum: { $add: ["$amGoals", "$arGoals"] },
          },
          won: {
            $sum: {
              $cond: ["$won", 1, 0],
            },
          },
          games: {
            $sum: {
              $cond: [true, 1, 0],
            },
          },
        },
      }
    ]);

    const best = await this.tournamentModel.countDocuments({ best: id });

    return { ...stats, best };
  }
}
