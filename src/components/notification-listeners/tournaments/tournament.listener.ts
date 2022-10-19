import { NotificationListener } from "@components/notification/abstract/notification-listener.absctract";
import { NotificationMessage } from "@components/notification/interfaces/notification-message.interface";
import { NotificationService } from "@components/notification/notification.service";
import { PuppeteerService } from "@components/puppeteer/puppeteer.service";
import { StatisticsService } from "@components/statistics/services/statistics.service";
import { TournamentType } from "@components/tournaments/enum/tour-type.enum";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import _ from "lodash";
import { fourPlayersTemplate } from "./templates/4-players.template";
import { fivePlayersTemplate } from "./templates/5-players.template";
import { sixPlayersTemplate } from "./templates/6-players.template";
import { eightPlayersTemplate } from "./templates/8-players.template";

@Injectable()
export class TournamentListener extends NotificationListener {
  constructor(
    readonly notificationService: NotificationService,
    private readonly statisticService: StatisticsService,
  ) {
    super(notificationService);
  }

  templates: any = {
    [TournamentType.FOUR_PLAYERS]: fourPlayersTemplate,
    [TournamentType.FIVE_PLAYERS]: fivePlayersTemplate,
    [TournamentType.SIX_PLAYERS]: sixPlayersTemplate,
    [TournamentType.EIGHT_PLAYERS]: eightPlayersTemplate,
  }

  pollKeywords: string[] = [
    'го футбик', 'го футбол', 'го футбік', 'може катнем', 'пора катнуть', 'go football',
    'го в футбол', 'го доиграем', 'го катнем', 'го катку', 'го сыграем', 'давай в футбол', 'давайте в футбол',
  ];

  bindHandlers() {}

  @OnEvent('tournament.generated')
  async handleTournamentGenerated({ tournament, players, teams } : any) {
    const _teams = await this.statisticService.getTeamsWinChance(teams, 50);
    const html = this.templates[tournament.type]({ players, teams: _teams, tournament });

    await this.notificationService.sendHtmlToAll(html);
  }

  @OnEvent('notification.message')
  handleMessage({ ctx }: NotificationMessage<any>) {
    const text: string = (ctx.message as any).text;
    const isMatched = this.pollKeywords.some((keywords) => text.toLowerCase().includes(keywords));

    if (!isMatched) return;

    ctx.replyWithPoll('Football?', ['+', '-', '+, ~10 min'], { is_anonymous: false });
  }
}