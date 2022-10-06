import { NotificationListener } from "@components/notification/abstract/notification-listener.absctract";
import { NotificationService } from "@components/notification/notification.service";
import { PuppeteerService } from "@components/puppeteer/puppeteer.service";
import { StatisticsService } from "@components/statistics/statistics.service";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ObjectId } from "mongodb";
import { tournamentPerformTemplate } from "./templates/tournament-perform.template";

@Injectable()
export class StatisticListener extends NotificationListener {
  constructor(
    readonly notificationService: NotificationService,
    
    private readonly puppeteerService: PuppeteerService,
    private readonly statisticService: StatisticsService,
  ) {
    super(notificationService);
  }

  protected bindHandlers() {}

  @OnEvent('tournament.closed')
  async handleCloseTournament({ performance: { goals, totalGoals } }: any) {
    if (!goals.length) return; 

    const html = tournamentPerformTemplate({ 
      name: goals[0].name, 
      gpgPercent: goals[0].goals / goals[0].games * 10,
      gpg: (goals[0].goals / goals[0].games).toFixed(2),
      totalGoals,
      goals: goals[0].goals,
      goalsPercent: goals[0].goals / totalGoals * 100
    });

    await this.notificationService.sendHtmlToAll(html, { caption: 
    `
Statistics 2.0 (demo)

<a href="http://onix-sports.herokuapp.com/statistic/leaderboard">Leaderboard</a>

GPG - ${goals[0].name}'s goals per game
TOTAL - ${goals[0].name}'s goals / all players goals

#bestperformer
#${goals[0].name}
    `, parse_mode: 'HTML' });
  }
}