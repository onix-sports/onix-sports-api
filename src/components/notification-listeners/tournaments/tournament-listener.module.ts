import { NotificationModule } from '@components/notification/notification.module';
import { PuppeteerModule } from '@components/puppeteer/puppeteer.module';
import { StatisticsModule } from '@components/statistics/statistics.module';
import { TournamentModule } from '@components/tournaments/tournament.module';
import { UsersModule } from '@components/users/users.module';
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
