import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { ChatRepository } from "./chat.repository";
import { ChatType } from "./enums/chat-type.enum";

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly eventEmitter: EventEmitter2,
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
    this.bot.on('message', (data) => {
      this.chatRepository.create({ chatId: data.chat.id, type: data.chat.type as ChatType });

      this.eventEmitter.emit('notification.message', { bot: this.bot, data });
    });
  }

  private bindCommands() {
    this.bot.command('subscribe', (data) => {
      this.chatRepository.subscribe(data.chat.id);

      data.reply('This chat was subscribed on notifications!');
    });

    this.bot.command('unsubscribe', (data) => {
      this.chatRepository.subscribe(data.chat.id);

      data.reply('This chat was unsubscribed from notifications!');
    });
  }

  public send(chatId: Number, text: string, extra?: ExtraReplyMessage) {
    this.bot.telegram.sendMessage(chatId as number, text, extra);
  }

  public async sendToAll(text: string, extra?: ExtraReplyMessage ) {
    const chats = await this.chatRepository.getAll();

    chats.forEach((chat) => {
      this.send(chat.chatId, text, extra);
    });
  }
}