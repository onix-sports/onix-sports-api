import { Module } from '@nestjs/common';
import { StatisticsController } from './controllers/statistics.controller';
import { StatisticsService } from './services/statistics.service';
import { MongooseModule } from '@nestjs/mongoose';
import statisticsConstants from './statistics-constants';
import { StatisticSchema } from './schemas/statistic.schema';
import StatisticsRepository from './repositories/statistics.repository';
import { GamesModule } from '@components/games/games.module';
import { FakeStatisticsRepository } from './repositories/fake-statistics.repository';
import { FakeStatisticsService } from './services/fake-statistics.service';
import { FakeStatisticsController } from './controllers/fake-statistics.controller';
import { FakeStatisticSchema } from './schemas/fake-statistics.schema';
import { TournamentConstants } from '@components/tournaments/tournament.constants';
import { TournamentSchema } from '@components/tournaments/schemas/tournament.schema';
import { ProfileStatisticSchema } from './schemas/profile-statistics.schema';
import { ProfileStatisticsRepository } from './repositories/profile-statistics.repository';

@Module({
  imports: [
    GamesModule,
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
      }
    ]),
  ],
  controllers: [StatisticsController, FakeStatisticsController],
  providers: [StatisticsService, StatisticsRepository, FakeStatisticsService, FakeStatisticsRepository, ProfileStatisticsRepository],
  exports: [StatisticsService, StatisticsRepository, FakeStatisticsService, FakeStatisticsRepository],
})
export class StatisticsModule {}
