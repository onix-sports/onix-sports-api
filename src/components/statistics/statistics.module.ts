import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { MongooseModule } from '@nestjs/mongoose';
import statisticsConstants from './statistics-constants';
import { StatisticSchema } from './schemas/statistic.schema';
import StatisticsRepository from './statistics.repository';
import { GamesModule } from '@components/games/games.module';
import { FakeStatisticsRepository } from './fake-statistics.repository';
import { FakeStatisticsService } from './fake-statistics.service';
import { FakeStatisticsController } from './fake-statistics.controller';
import { FakeStatisticSchema } from './schemas/fake-statistics.schema';
import { TournamentConstants } from '@components/tournaments/tournament.constants';
import { TournamentSchema } from '@components/tournaments/schemas/tournament.schema';

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
        name: TournamentConstants.models.tournaments,
        collection: TournamentConstants.models.tournaments,
        schema: TournamentSchema,
      }
    ]),
  ],
  controllers: [StatisticsController, FakeStatisticsController],
  providers: [StatisticsService, StatisticsRepository, FakeStatisticsService, FakeStatisticsRepository],
  exports: [StatisticsService, StatisticsRepository, FakeStatisticsService, FakeStatisticsRepository],
})
export class StatisticsModule {}
