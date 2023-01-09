import { MongoUpdate } from '@components/v1/common/types/mongo-update.type';
import { Injectable } from '@nestjs/common';
import { FakeStatisticsRepository } from '../repositories/fake-statistics.repository';
import { FakeStatisticEntity } from '../schemas/fake-statistics.schema';

@Injectable()
export class FakeStatisticsService {
    constructor(
    private readonly fakeStatisticsRepository: FakeStatisticsRepository,
    ) {}

    public setStats(user: any, update: MongoUpdate<FakeStatisticEntity>) {
        return this.fakeStatisticsRepository.setStats(user, { ...update, user });
    }

    public getStats() {
        return this.fakeStatisticsRepository.getStats();
    }
}