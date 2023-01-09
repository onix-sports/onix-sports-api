import { GamesModule } from "@components/games/games.module";
import { NotificationModule } from "@components/notification/notification.module";
import { StoriesModule } from "@components/stories/stories.module";
import { Module } from "@nestjs/common";

import { GameListener } from "./game.listener";

@Module({
  imports: [
    GamesModule,
    NotificationModule,
    StoriesModule
  ],
  providers: [GameListener],
})
export class GameListenerModule {}