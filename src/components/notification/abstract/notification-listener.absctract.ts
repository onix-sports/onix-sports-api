import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { NotificationService } from '../notification.service';

export abstract class NotificationListener {
    constructor(
    readonly notificationService: NotificationService,
    ) {}

    bot: Telegraf<Context<Update>>;

    onModuleInit() {
        this.bot = this.notificationService.Bot;

        this.bindHandlers();
    }

  protected abstract bindHandlers(): void;
}
