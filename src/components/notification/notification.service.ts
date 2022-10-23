import { PuppeteerService } from "@components/puppeteer/puppeteer.service";
import { UserEntity } from "@components/users/schemas/user.schema";
import { UsersService } from "@components/users/users.service";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EventEmitter2 } from "eventemitter2";
import { Markup, Telegraf } from "telegraf";
import { ExtraPhoto, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { InputFile } from "typegram";
import { ChatRepository } from "./chat.repository";
import { ChatType } from "./enums/chat-type.enum";

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
    this.bot.on('message', (ctx) => {
      this.chatRepository.create({ chatId: ctx.chat.id, type: ctx.chat.type as ChatType });

      this.eventEmitter.emit('notification.message', { bot: this.bot, ctx });
    });
  }

  /** Temp solution */
  @OnEvent('telegram.updateAvatar')
  public async updateAvatar(user: UserEntity) {
    if (!user.telegram.id) return;

    const avatar = await this.Bot.telegram.getUserProfilePhotos(user.telegram.id,  0, 1).then((res: any) => (res.photos[0] || []).slice(-1)[0]);

    if (avatar) {
      const result = await this.Bot.telegram.getFileLink(avatar.file_id);
      
      await this.usersService.updateAvatar(user?._id, result.href);

      return result.href;
    }
  }

  private async profileReadyHandler(data: any) {
    const user = await this.usersService.updateTelegramData(data.from.id, data.from.username, data.from);
    // const avatar = await data.telegram.getUserProfilePhotos(data.from.id,  0, 1).then((res: any) => (res.photos[0] || []).slice(-1)[0]);

    // if (avatar) {
    //   const result = await data.telegram.getFileLink(avatar.file_id);
      
    //   await this.usersService.updateAvatar(user?._id, result.href);
    // }

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
    this.bot.start(this.profileReadyHandler.bind(this))
  }

  public send(chatId: Number, text: string, extra?: ExtraReplyMessage) {
    return this.bot.telegram.sendMessage(chatId as number, text, extra);
  }

  public sendPhoto(chatId: Number, photo: string | InputFile, extra?: ExtraPhoto) {
    return this.bot.telegram.sendPhoto(chatId as number, photo, extra);
  }

  public async sendToAll(text: string, extra?: ExtraReplyMessage ) {
    const chats = await this.chatRepository.getSubscribers();

    chats.forEach((chat) => {
      this.send(chat.chatId, text, extra);
    });
  }

  public async sendPhotoToAll(photo: any, extra?: ExtraPhoto) {
    const chats = await this.chatRepository.getSubscribers();

    chats.forEach((chat) => {
      this.sendPhoto(chat.chatId, photo, extra);
    });
  }

  public async sendHtmlToAll(html: string, extra?: ExtraPhoto) {
    this.puppeteerService.removeScreenshots();
    const path = await this.puppeteerService.screenshot(html);

    await this.sendPhotoToAll({ source: path }, extra);
  }
}