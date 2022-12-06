import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PuppeteerModule as MainPuppeteerModule } from 'nest-puppeteer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import V1Module from '@components/v1/v1.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URL as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }),
        EventEmitterModule.forRoot({
            delimiter: '.',
        }),
        ScheduleModule.forRoot(),
        MainPuppeteerModule.forRoot(),
        V1Module,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
