import { Module } from '@nestjs/common';
import { ActionModule } from '../action/action.module';
import { GamesModule } from '../games/games.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { TournamentModule } from '../tournaments/tournament.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [
        StatisticsModule,
        GamesModule,
        ActionModule,
        TournamentModule,
    ],
    providers: [AdminService],
    controllers: [AdminController],
})
export class AdminModule {}
