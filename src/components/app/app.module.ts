import { ActionModule } from '@components/action/action.module';
import { GamesModule } from '@components/games/games.module';
import { ListenersModule } from '@components/notification-listeners/listeners.module';
import { NotificationModule } from '@components/notification/notification.module';
import { StatisticsModule } from '@components/statistics/statistics.module';
import { TournamentModule } from '@components/tournaments/tournament.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PuppeteerModule as MainPuppeteerModule } from 'nest-puppeteer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeassonsModule } from '@components/seassons/seassons.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URL as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    EventEmitterModule.forRoot({
      delimiter: '.'
    }),
    ScheduleModule.forRoot(),
    MainPuppeteerModule.forRoot(),
    StatisticsModule,
    GamesModule,
    TournamentModule,
    ActionModule,
    NotificationModule,
    ListenersModule,
    SeassonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
