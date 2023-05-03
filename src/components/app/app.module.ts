import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PuppeteerModule as MainPuppeteerModule } from 'nest-puppeteer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import V1Module from '@components/v1/v1.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
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
        RedisModule.forRootAsync({
            useFactory: (config: ConfigService) => ({
                config: {
                    url: config.get<string>('REDIS_URL'),
                    password: config.get<string>('REDIS_PASSWORD'),
                },
            }),
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        MainPuppeteerModule.forRoot(),
        V1Module,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
