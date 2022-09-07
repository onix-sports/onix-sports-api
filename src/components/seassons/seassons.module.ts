import { StatisticsModule } from '@components/statistics/statistics.module';
import { Module } from '@nestjs/common';
import { SeassonsController } from './seassons.controller';
import { SeassonsService } from './seassons.service';

@Module({
  imports: [StatisticsModule],
  controllers: [SeassonsController],
  providers: [SeassonsService]
})
export class SeassonsModule {}
