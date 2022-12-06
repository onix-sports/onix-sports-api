import { NotificationModule } from '@components/v1/notification/notification.module';
import { PuppeteerModule } from '@components/v1/puppeteer/puppeteer.module';
import { StatisticsModule } from '@components/v1/statistics/statistics.module';
import { TournamentModule } from '@components/v1/tournaments/tournament.module';
import { UsersModule } from '@components/v1/users/users.module';
import { Module } from '@nestjs/common';
import { TournamentListener } from './tournament.listener';

@Module({
    imports: [
        StatisticsModule,
        NotificationModule,
        PuppeteerModule,
        TournamentModule,
        UsersModule,
    ],
    providers: [TournamentListener],
})
export class TournamentListenerModule {}
