import { Module } from "@nestjs/common";

import { NotificationModule } from "@components/notification/notification.module";
import { PuppeteerModule } from "@components/puppeteer/puppeteer.module";
import { StatisticsModule } from "@components/statistics/statistics.module";
import { StoriesModule } from "@components/stories/stories.module";
import { TournamentModule } from "@components/tournaments/tournament.module";
import { UsersModule } from "@components/users/users.module";

import { TournamentListener } from "./tournament.listener";

@Module({
  imports: [
    StatisticsModule,
    NotificationModule,
    PuppeteerModule,
    TournamentModule,
    UsersModule,
    StoriesModule
  ],
  providers: [TournamentListener],
})
export class TournamentListenerModule {}