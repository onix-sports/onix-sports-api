import { StatisticsModule } from '@components/v1/statistics/statistics.module';
import { UsersModule } from '@components/v1/users/users.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentSchema } from './schemas/tournament.schema';
import { TournamentConstants } from './tournament.constants';
import { TournamentController } from './tournament.controller';
import { TournamentRepository } from './tournament.repository';
import { TournamentService } from './tournament.service';

@Module({
    imports: [
        UsersModule,
        MongooseModule.forFeature([
            {
                name: TournamentConstants.models.tournaments,
                collection: TournamentConstants.models.tournaments,
                schema: TournamentSchema,
            },
        ]),
        StatisticsModule,
    ],
    controllers: [TournamentController],
    providers: [TournamentService, TournamentRepository],
    exports: [TournamentService],
})
export class TournamentModule {}
