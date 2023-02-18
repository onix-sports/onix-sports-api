import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesModule } from '@components/v1/games/games.module';
import { TournamentConstants } from '@components/v1/tournaments/tournament.constants';
import { TournamentSchema } from '@components/v1/tournaments/schemas/tournament.schema';
import { StatisticsController } from './controllers/statistics.controller';
import { StatisticsService } from './services/statistics.service';
import statisticsConstants from './statistics-constants';
import { StatisticSchema } from './schemas/statistic.schema';
import StatisticsRepository from './repositories/statistics.repository';
import { FakeStatisticsRepository } from './repositories/fake-statistics.repository';
import { FakeStatisticsService } from './services/fake-statistics.service';
import { FakeStatisticsController } from './controllers/fake-statistics.controller';
import { FakeStatisticSchema } from './schemas/fake-statistics.schema';
import { ProfileStatisticSchema } from './schemas/profile-statistics.schema';
import { ProfileStatisticsRepository } from './repositories/profile-statistics.repository';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        // @TODO: resolve circular dependency
        forwardRef(() => GamesModule),
        UsersModule,
        MongooseModule.forFeature([
            {
                name: statisticsConstants.models.statistics,
                collection: statisticsConstants.models.statistics,
                schema: StatisticSchema,
            },
            {
                name: statisticsConstants.models.fakeStatistics,
                collection: statisticsConstants.models.fakeStatistics,
                schema: FakeStatisticSchema,
            },
            {
                name: statisticsConstants.models.profileStatistics,
                collection: statisticsConstants.models.profileStatistics,
                schema: ProfileStatisticSchema,
            },
            {
                name: TournamentConstants.models.tournaments,
                collection: TournamentConstants.models.tournaments,
                schema: TournamentSchema,
            },
        ]),
    ],
    controllers: [StatisticsController, FakeStatisticsController],
    providers: [StatisticsService, StatisticsRepository, FakeStatisticsService, FakeStatisticsRepository, ProfileStatisticsRepository],
    exports: [StatisticsService, StatisticsRepository, FakeStatisticsService, FakeStatisticsRepository],
})
export class StatisticsModule {}
