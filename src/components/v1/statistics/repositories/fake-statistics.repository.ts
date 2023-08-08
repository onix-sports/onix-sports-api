import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { FakeStatisticEntity } from '../schemas/fake-statistics.schema';
import statisticsConstants from '../statistics-constants';

@Injectable()
export class FakeStatisticsRepository {
    constructor(
    @InjectModel(statisticsConstants.models.fakeStatistics)
    private readonly fakeStatisticsModel: Model<FakeStatisticEntity>,
    ) {}

    public setStats(organization: ObjectId, user: ObjectId, $set: any) {
        return this.fakeStatisticsModel.findOneAndUpdate({ organization, user }, { $set }, { upsert: true, new: true });
    }

    public getStats(organization: ObjectId) {
        return this.fakeStatisticsModel.find({ enabled: true, organization });
    }
}
