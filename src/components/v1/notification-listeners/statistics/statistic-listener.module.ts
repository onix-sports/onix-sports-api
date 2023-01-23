import { NotificationModule } from '@components/v1/notification/notification.module';
import { PuppeteerModule } from '@components/v1/puppeteer/puppeteer.module';
import { StatisticsModule } from '@components/v1/statistics/statistics.module';
import { Module } from '@nestjs/common';
import { StatisticListener } from './statistic.listener';

@Module({
    imports: [
        StatisticsModule,
        PuppeteerModule,
        NotificationModule,
    ],
    providers: [StatisticListener],
})
export class StatisticListenerModule {}
