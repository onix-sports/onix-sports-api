import { GamesModule } from '@components/games/games.module';
import { StatisticsModule } from '@components/statistics/statistics.module';
import { UsersModule } from '@components/users/users.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentSchema } from './schemas/tournament.schema';
import { TournamentGeneratorController } from './tournament-generator.controller';
import { TournamentGenerator } from './tournament-generator.service';
import { TournamentConstants } from './tournament.constants';
import { TournamentController } from './tournament.controller';
import { TournamentRepository } from './tournament.repository';
import { TournamentService } from './tournament.service';

@Module({
    imports: [
        UsersModule,
        GamesModule,
        MongooseModule.forFeature([
            {
                name: TournamentConstants.models.tournaments,
                collection: TournamentConstants.models.tournaments,
                schema: TournamentSchema,
            },
        ]),
        StatisticsModule,
    ],
    controllers: [TournamentController, TournamentGeneratorController],
    providers: [TournamentService, TournamentRepository, TournamentGenerator],
    exports: [TournamentService, TournamentGenerator],
})
export class TournamentModule {}
