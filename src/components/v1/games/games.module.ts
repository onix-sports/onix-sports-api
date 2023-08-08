import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameSchema } from './schemas/game.schema';
import GamesRepository from './games.repository';
import gamesConstants from './games-constants';
import { GamesGateway } from './games.gateway';
import { GameProcessService } from './game-process.service';
import { GamesGatewayDoc } from './games.gateway.doc';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: gamesConstants.models.games,
                collection: gamesConstants.models.games,
                schema: GameSchema,
            },
        ]),
        UsersModule,
        OrganizationsModule,
    ],
    controllers: [GamesController, GamesGatewayDoc],
    providers: [GamesService, GamesRepository, GamesGateway, GameProcessService],
    exports: [GamesService, GamesRepository],
})
export class GamesModule {}
