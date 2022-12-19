import { GamesModule } from '@components/v1/games/games.module';
import { NotificationModule } from '@components/v1/notification/notification.module';
import { Module } from '@nestjs/common';
import { GameListener } from './game.listener';

@Module({
    imports: [
        GamesModule,
        NotificationModule,
    ],
    providers: [GameListener],
})
export class GameListenerModule {}
