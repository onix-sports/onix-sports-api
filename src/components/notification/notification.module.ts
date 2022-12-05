import { PuppeteerModule } from '@components/puppeteer/puppeteer.module';
import { UsersModule } from '@components/users/users.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRepository } from './chat.repository';
import { notificationConstants } from './notification.constants';
import { NotificationService } from './notification.service';
import { ChatSchema } from './schemas/chat.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: notificationConstants.models.chats,
            collection: notificationConstants.models.chats,
            schema: ChatSchema,
        }]),
        PuppeteerModule,
        UsersModule,
    ],
    providers: [NotificationService, ChatRepository],
    exports: [NotificationService],
})
export class NotificationModule {}
