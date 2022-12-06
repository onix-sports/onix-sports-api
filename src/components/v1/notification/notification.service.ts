import { PuppeteerService, ScreenshotOptions } from '@components/v1/puppeteer/puppeteer.service';
import { UserEntity } from '@components/v1/users/schemas/user.schema';
import userConstants from '@components/v1/users/user-constants';
import { UsersService } from '@components/v1/users/users.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Markup, Telegraf } from 'telegraf';
import {
    ExtraAnimation, ExtraPhoto, ExtraPoll, ExtraReplyMessage, ExtraStopPoll,
} from 'telegraf/typings/telegram-types';
import { InputFile } from 'typegram';
import { ChatRepository } from './chat.repository';
import { ChatType } from './enums/chat-type.enum';

@Injectable()
export class NotificationService implements OnModuleInit {
    constructor(
    private readonly chatRepository: ChatRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly puppeteerService: PuppeteerService,
    private readonly usersService: UsersService,
    ) {}

    private logger: Logger = new Logger(NotificationService.name);

    private bot = new Telegraf(process.env.TELEGRAM_API_KEY as string);

    get Bot() {
        return this.bot;
    }

    async onModuleInit() {
        this.logger.log('Initialization...');

        await this.bot.launch();

        this.bindCommands();
        this.bindHandlers();

        this.logger.log('Bot has been launched!');
    }

    private bindHandlers() {
        this.bot.catch((err) => {
            this.logger.error(err);
        });

        this.bot.on('message', (ctx) => {
            this.chatRepository.create({ chatId: ctx.chat.id, type: ctx.chat.type as ChatType });

            this.eventEmitter.emit('notification.message', { bot: this.bot, ctx });
        });
        this.bot.on('poll_answer', async (ctx) => {
            const user = await this.usersService.updateTelegramData(ctx.pollAnswer.user.id, ctx.pollAnswer.user.username, ctx.pollAnswer.user);

            this.eventEmitter.emit('notification.poll_answer', { bot: this.bot, ctx, user });
        });
    }

    /** Temp solution */
    @OnEvent('telegram.updateAvatar')
    public async updateAvatar(user: UserEntity) {
        if (!user.telegram.id) return userConstants.defaultAvatar;

        const avatar = await this.Bot.telegram.getUserProfilePhotos(user.telegram.id, 0, 1).then((res: any) => (res.photos[0] || []).slice(-1)[0]);
        const result = avatar ? await this.Bot.telegram.getFileLink(avatar.file_id) : { href: userConstants.defaultAvatar };

        await this.usersService.updateAvatar(user?._id, result.href);

        return result.href;
    }

    private async profileReadyHandler(data: any) {
        const user = await this.usersService.updateTelegramData(data.from.id, data.from.username, data.from);

        data.reply(`${data.from.first_name}, your profile is ready!`, {
            reply_markup: Markup.inlineKeyboard([
                Markup.button.url('Profile', `http://onix-sports.herokuapp.com/profile/${user?._id}`),
            ], { columns: 1 }).reply_markup,
        });
    }

    private bindCommands() {
        this.bot.command('subscribe', async (data) => {
            await this.chatRepository.subscribe(data.chat.id);

            data.reply('This chat was subscribed on notifications!');
        });

        this.bot.command('unsubscribe', async (data) => {
            await this.chatRepository.unsubscribe(data.chat.id);

            data.reply('This chat was unsubscribed from notifications!');
        });

        this.bot.command('profile', this.profileReadyHandler.bind(this));
        this.bot.start(this.profileReadyHandler.bind(this));

        this.bot.command('tournament_request', async (data) => {
            const user = await this.usersService.updateTelegramData(data.from.id, data.from.username, data.from);

            this.eventEmitter.emit('tournament.request', { bot: this.bot, ctx: data, user });
        });

        this.bot.command('tournament_generate', async (data) => {
            const user = await this.usersService.updateTelegramData(data.from.id, data.from.username, data.from);

            this.eventEmitter.emit('tournament.generate', { bot: this.bot, ctx: data, user });
        });
    }

    public send(chatId: Number, text: string, extra?: ExtraReplyMessage) {
        return this.bot.telegram.sendMessage(chatId as number, text, extra);
    }

    public sendPhoto(chatId: Number, photo: string | InputFile, extra?: ExtraPhoto | ExtraAnimation) {
        if ((photo as any).source.endsWith('.gif')) {
            return this.bot.telegram.sendAnimation(chatId as number, photo, extra);
        }

        return this.bot.telegram.sendPhoto(chatId as number, photo, extra);
    }

    public async sendHtml(chatId: Number, html: string, extra?: ExtraPhoto, options?: ScreenshotOptions) {
        const path = await this.puppeteerService.screenshot(html, options);

        return this.sendPhoto(chatId, { source: path } as InputFile, extra);
    }

    public sendPoll(chatId: Number, question: string, options: string[], extra?: ExtraPoll) {
        return this.bot.telegram.sendPoll(chatId as number, question, options, extra);
    }

    public async sendToMain(text: string, extra?: ExtraReplyMessage) {
        const chat = await this.chatRepository.getMain();

        if (!chat) return Promise.resolve(null);

        return this.send(chat.chatId, text, extra);
    }

    public async sendPhotoToMain(photo: any, extra?: ExtraPhoto) {
        const chat = await this.chatRepository.getMain();

        if (!chat) return Promise.resolve(null);

        return this.sendPhoto(chat.chatId, photo, extra);
    }

    public async sendHtmlToMain(html: string, extra?: ExtraPhoto, options?: ScreenshotOptions) {
        const path = await this.puppeteerService.screenshot(html, options);

        return this.sendPhotoToMain({ source: path }, extra);
    }

    public async sendPollToMain(question: string, options: string[], extra?: ExtraPoll) {
        const chat = await this.chatRepository.getMain();

        if (!chat) return Promise.resolve(null);

        const result = await this.sendPoll(chat.chatId as number, question, options, extra);

        return result;
    }

    public async closePoll(chatId: string | number, messageId: number, extra?: ExtraStopPoll | undefined) {
        return this.bot.telegram.stopPoll(chatId, messageId, extra);
    }
}
