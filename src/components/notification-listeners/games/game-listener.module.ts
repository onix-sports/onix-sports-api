import { GamesModule } from '@components/games/games.module';
import { NotificationModule } from '@components/notification/notification.module';
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
