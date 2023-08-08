import { MongoUpdate } from '@components/v1/common/types/mongo-update.type';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { FakeStatisticsRepository } from '../repositories/fake-statistics.repository';
import { FakeStatisticEntity } from '../schemas/fake-statistics.schema';

@Injectable()
export class FakeStatisticsService {
    constructor(
    private readonly fakeStatisticsRepository: FakeStatisticsRepository,
    ) {}

    public setStats(organization: ObjectId, user: ObjectId, update: MongoUpdate<FakeStatisticEntity>) {
        return this.fakeStatisticsRepository.setStats(organization, user, { ...update, user });
    }

    public getStats(organization: ObjectId) {
        return this.fakeStatisticsRepository.getStats(organization);
    }
}
