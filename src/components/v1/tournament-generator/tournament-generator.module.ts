import { Module } from '@nestjs/common';
import { GamesModule } from '../games/games.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { TournamentModule } from '../tournaments/tournament.module';
import { UsersModule } from '../users/users.module';
import { TournamentGeneratorController } from './tournament-generator.controller';
import { TournamentGenerator } from './tournament-generator.service';

@Module({
    imports: [
        GamesModule,
        TournamentModule,
        UsersModule,
        StatisticsModule,
    ],
    controllers: [TournamentGeneratorController],
    providers: [TournamentGenerator],
    exports: [TournamentGenerator],
})
export class TournamentGeneratorModule {}
