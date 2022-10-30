import { GameInfo } from "@components/games/core/interfaces/game-info.interface";
import { GamesService } from "@components/games/games.service";
import { NotificationListener } from "@components/notification/abstract/notification-listener.absctract";
import { NotificationService } from "@components/notification/notification.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ObjectId } from 'mongodb';
import { gameFinishedTemplate } from "./templates/game-finished.template";
import { gameStartedTemplate } from "./templates/game-started.template";

@Injectable()
export class GameListener extends NotificationListener {
  constructor(
    readonly notificationService: NotificationService,
    
    private readonly gameService: GamesService,
  ) {
    super(notificationService);
  }

  private notify = {
    'notify_on_end': new Set(),
  };

  protected bindHandlers() {
    this.bot.action('notify_on_end', (ctx) => {
      this.notify['notify_on_end'].add(ctx.from?.id as never);

      ctx.answerCbQuery('Success. Make sure that you have started a chat with bot @OnixSportsBot');
    })
  }

  @OnEvent('game.started')
  async handleGameStart({ id }: { id: string }) {
    const { players, _id } = await this.gameService.getGameInfo(new ObjectId(id));

    this.notificationService.sendToMain(...gameStartedTemplate({ players, _id }));
  }

  @OnEvent('game.finished')
  handleGameFinish({ id, info }: { id: string, info: GameInfo }) {
    this.notify['notify_on_end'].forEach((chatId) => {
      this.notificationService.send(chatId as Number, ...gameFinishedTemplate(info));

      this.notify['notify_on_end'].delete(chatId);
    });
  }
}