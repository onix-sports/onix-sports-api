import { Module } from '@nestjs/common';
import { ActionModule } from '@components/v1/action/action.module';
import { GamesModule } from '@components/v1/games/games.module';
import { ListenersModule } from '@components/v1/notification-listeners/listeners.module';
import { NotificationModule } from '@components/v1/notification/notification.module';
import { StatisticsModule } from '@components/v1/statistics/statistics.module';
import { TournamentModule } from '@components/v1/tournaments/tournament.module';
import { SeassonsModule } from '@components/v1/seassons/seassons.module';
import { AuthModule } from '@components/v1/auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
    imports: [
        StatisticsModule,
        GamesModule,
        TournamentModule,
        ActionModule,
        NotificationModule,
        ListenersModule,
        SeassonsModule,
        AdminModule,
        AuthModule,
        OrganizationsModule,
    ],
})
export default class V1Module {}
