import { NotificationModule } from "@components/notification/notification.module";
import { PuppeteerModule } from "@components/puppeteer/puppeteer.module";
import { StatisticsModule } from "@components/statistics/statistics.module";
import { StoriesModule } from "@components/stories/stories.module";
import { Module } from "@nestjs/common";

import { StatisticListener } from "./statistic.listener";

@Module({
  imports: [
    StatisticsModule,
    PuppeteerModule,
    NotificationModule,
    StoriesModule
  ],
  providers: [StatisticListener],
})
export class StatisticListenerModule {}