import { NotificationListener } from "@components/notification/abstract/notification-listener.absctract";
import { NotificationService } from "@components/notification/notification.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { StoriesService } from "@components/stories/stories.service";
import { StoryTypeEnum } from "@components/stories/enums/story-type.enum";

import { tournamentPerformTemplate } from "./templates/tournament-perform.template";
import { Markup } from "telegraf";

@Injectable()
export class StatisticListener extends NotificationListener {
  constructor(
    readonly notificationService: NotificationService,
    private readonly storiesService: StoriesService,
  ) {
    super(notificationService);
  }

  protected bindHandlers() {}

  @OnEvent('tournament.closed')
  async handleCloseTournament({ performance: { goals, totalGoals } }: any) {
    if (!goals.length) return; 

    const { html, caption } = tournamentPerformTemplate({ 
      name: goals[0].name, 
      gpgPercent: goals[0].goals / goals[0].games * 10,
      gpg: (goals[0].goals / goals[0].games).toFixed(2),
      totalGoals,
      goals: goals[0].goals,
      goalsPercent: goals[0].goals / totalGoals * 100
    });

    await this.storiesService.create({ content: { goals, totalGoals }, type: StoryTypeEnum.bestPerformer  })

    await this.notificationService.sendHtmlToMain(html, { 
      caption, 
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        Markup.button.url('My profile', `https://telegram.me/${process.env.BOT_USERNAME}`),
        Markup.button.url(`${goals[0].name}\'s profile`, `http://onix-sports.herokuapp.com/profile/${goals[0]._id}`),
        Markup.button.url('Leaderboard', `http://onix-sports.herokuapp.com/leaderboard`)
      ], { columns: 2 }).reply_markup,
    });
  }
}