import { Module } from "@nestjs/common";

import { GameListenerModule } from "./games/game-listener.module";
import { StatisticListenerModule } from "./statistics/statistic-listener.module";
import { TournamentListenerModule } from "./tournaments/tournament-listener.module";

@Module({
  imports: [
    StatisticListenerModule,
    TournamentListenerModule,
    GameListenerModule,
  ],
})
export class ListenersModule {}