import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ProfileStatisticEntity } from '../schemas/profile-statistics.schema';
import statisticsConstants from '../statistics-constants';

@Injectable()
export class ProfileStatisticsRepository {
    constructor(
        @InjectModel(statisticsConstants.models.profileStatistics)
        private readonly profileStatisticsModel: Model<ProfileStatisticEntity>,
    ) {}

    public getByUserId(user: ObjectId) {
    // @TODO: remove strictPopulate: false
        return this.profileStatisticsModel.findOne({ user }).populate({
            path: 'user longestGame shortestGame lastGames',
            populate: {
                path: 'stats players',
                populate: {
                    path: 'user',
                    strictPopulate: false,
                },
                strictPopulate: false,
            },
            strictPopulate: false,
        }).lean();
    }

    public createDefault(user: ObjectId) {
        return this.profileStatisticsModel.create({ user });
    }

    public async updateGameStat(user: ObjectId, data: any) {
        const statistic = await this.profileStatisticsModel.findOneAndUpdate({ user: new ObjectId(user) }, {
            $inc: {
                goals: data.mGoals + data.rGoals,
                mGoals: data.mGoals,
                rGoals: data.rGoals,
                aGoals: data.amGoals + data.arGoals,
                arGoals: data.arGoals,
                amGoals: data.amGoals,
                won: data.won ? 1 : 0,
                games: 1,
                totalTime: data.totalTime,
                keeperTime: data.keeperTime,
                forwardTime: data.forwardTime,
                goalsSkipped: data.goalsSkipped,
            },
            $push: {
                lastGames: data.gameId,
                winrateLine: data.winrate,
                goalsLine: data.mGoals + data.rGoals,
            },
            $set: {
                longestGame: data.longestGame,
                shortestGame: data.shortestGame,
            },
        }, { new: true });

        if (statistic) {
            statistic.lastGames = statistic.lastGames.slice(1, 10);
        }

        return statistic?.save();
    }

    public updateTournamentStat(user: ObjectId, isBest: boolean, isRespected: boolean = false) {
        return this.profileStatisticsModel.updateOne({ user }, {
            $inc: {
                best: isBest ? 1 : 0,
                respected: isRespected ? 1 : 0,
            },
        });
    }
}
