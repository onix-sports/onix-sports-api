import { NotificationListener } from '@components/notification/abstract/notification-listener.absctract';
import { MatchedContext, NotificationMessage } from '@components/notification/interfaces/notification-message.interface';
import { NotificationService } from '@components/notification/notification.service';
import { StatisticsService } from '@components/statistics/services/statistics.service';
import { TournamentType } from '@components/tournaments/enum/tour-type.enum';
import { PollAnswer, TournamentDocument } from '@components/tournaments/schemas/tournament.schema';
import { TournamentService } from '@components/tournaments/tournament.service';
import { UserEntity } from '@components/users/schemas/user.schema';
import { UsersService } from '@components/users/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { setTimeout } from 'timers/promises';
import { Context } from 'telegraf';
import { TournamentGenerator } from '@components/tournaments/tournament-generator.service';
import { RolesEnum } from '@decorators/roles.decorator';
import { fourPlayersTemplate } from './templates/4-players.template';
import { fivePlayersTemplate } from './templates/5-players.template';
import { sixPlayersTemplate } from './templates/6-players.template';
import { eightPlayersTemplate } from './templates/8-players.template';
import { respectedPlayerTemplate } from './templates/respected.template';

@Injectable()
export class TournamentListener extends NotificationListener {
    constructor(
    readonly notificationService: NotificationService,
    private readonly statisticService: StatisticsService,
    private readonly tournamentService: TournamentService,
    private readonly userService: UsersService,
    private readonly tournamentGenerator: TournamentGenerator,
    ) {
        super(notificationService);
    }

    private readonly logger: Logger = new Logger(TournamentListener.name);

    templates: any = {
        [TournamentType.FOUR_PLAYERS]: fourPlayersTemplate,
        [TournamentType.FIVE_PLAYERS]: fivePlayersTemplate,
        [TournamentType.SIX_PLAYERS]: sixPlayersTemplate,
        [TournamentType.EIGHT_PLAYERS]: eightPlayersTemplate,
    };

    pollKeywords: string[] = [
        'го футбик', 'го футбол', 'го футбік', 'може катнем', 'пора катнуть', 'go football',
        'го в футбол', 'го доиграем', 'го катнем', 'го катку', 'го сыграем', 'давай в футбол', 'давайте в футбол',
    ];

    tournamentsRequests: any = {};

    bindHandlers() {}

    private filterResults(results: {[key: string]: ObjectId[]}, answers: PollAnswer[], includeAutovotes: boolean = false) {
        const filteredResults: any = {};

        Object.keys(results).forEach((key: string) => {
            filteredResults[key] = results[key].filter((userId) => {
                return answers
                    .some(({ data }) => userId.equals(data)) && (includeAutovotes || !userId.equals(answers[key as unknown as number].data));
            });
        });

        return filteredResults;
    }

    private getMinimumVotes(answers: PollAnswer[]) {
        return Math.ceil(answers.length / 2) + (answers.length % 2 === 0 ? 1 : 0);
    }

    private getMaximumVotes(answers: PollAnswer[]) {
        return answers.length;
    }

    private getCurrentWinner(results: {[key: string]: ObjectId[]}, answers: PollAnswer[]) {
        const result = Object.values(results).reduce((acc, val) => (val.length > acc.length ? val : acc));
        const index = Object.values(results).indexOf(result);

        return { ...answers[Object.keys(results)[index] as unknown as number], votes: result.length, index: Object.keys(results)[index] };
    }

    private getTotalVotes(results: {[key: string]: ObjectId[]}) {
        return Object.values(results).reduce((acc, val) => acc + val.length, 0);
    }

    private async requestTournament(ctx: MatchedContext<Context<Update>, 'text' | 'message'>) {
        const result = await ctx.replyWithPoll('Football?', ['+', '-', '+, ~10 min'], { is_anonymous: false });

        this.tournamentsRequests[result.chat.id] = {
            pollId: result.poll.id,
            messageId: result.message_id,
            players: [
                // Users for test
                new ObjectId('6156d2243a12c500166d99db'),
                new ObjectId('6156d22c3a12c500166d99dc'),
                new ObjectId('6156d2393a12c500166d99dd'),
                new ObjectId('6156d2433a12c500166d99de'),
                new ObjectId('6156d24c3a12c500166d99df'),
                new ObjectId('6156d2563a12c500166d99e0'),
            ],
        };
    }

    @OnEvent('notification.poll_answer')
    async handleTournamentPollAnswer({ ctx, user }: NotificationMessage<'poll_answer'> & { user: UserEntity }) {
        const chatId = Object
            .keys(this.tournamentsRequests)
            .find((key) => this.tournamentsRequests[key].pollId === ctx.pollAnswer.poll_id);

        if (!chatId) return;

        if (ctx.pollAnswer.option_ids[0] === 2) return;

        this.tournamentsRequests[chatId].players.push(user._id);
    }

    @OnEvent('tournament.request')
    async handleTournamentRequest({ ctx }: NotificationMessage<'text'>) {
        this.requestTournament(ctx);
    }

    @OnEvent('tournament.generate')
    async handleTournamentGenerate({ ctx, user }: NotificationMessage<'text'> & { user: UserEntity }) {
        if (user.role !== RolesEnum.admin) {
            return ctx.reply('You don\'t have permissions to do this.');
        }

        const request = this.tournamentsRequests[ctx.chat.id];

        if (!request) {
            return ctx.reply('You have to request tournament first.');
        }

        await this.tournamentGenerator.generate(request.players)
            .then(() => {
                this.notificationService.closePoll(ctx.chat.id, request.messageId);

                delete this.tournamentsRequests[ctx.chat.id];
            })
            .catch((error) => {
                ctx.reply(error.message);
            });

        return null;
    }

    @OnEvent('tournament.generated')
    async handleTournamentGenerated({ tournament, players, teams } : any) {
        if (!this.templates[tournament.type]) return;

        const _teams = await this.statisticService.getTeamsWinChance(teams, 50);
        const html = this.templates[tournament.type]({ players, teams: _teams, tournament });
        const message = await this.notificationService.sendHtmlToMain(html);

        if (message) {
            await this.tournamentService.setTelegramData(tournament._id, { messageId: message.message_id, chatId: message.chat.id });
        }
    }

    @OnEvent('notification.message')
    handleMessage({ ctx }: NotificationMessage<'message'>) {
        const { text } = ctx.message as Update.New & Update.NonChannel & Message & { text?: string };

        this.logger.log(ctx.message);

        if (!text || ctx.chat.type === 'private') return;

        const isMatched = this.pollKeywords.some((keywords) => text.toLowerCase().includes(keywords));

        if (!isMatched) return;

        this.requestTournament(ctx);
    }

    @OnEvent('tournament.closed')
    async handleCloseTournament({ tournament }: { tournament: TournamentDocument }) {
        if (!tournament.telegram) return;

        setTimeout(1000 * 10).then(async () => {
            const _players = (tournament.players[0] as unknown as UserEntity[]);
            const players = _players.map(({ name }: UserEntity) => name);

            const answers: PollAnswer[] = _players.map(({ name, _id }: UserEntity) => ({ label: name, data: _id }));
            const question = `Who was the MVP of tournament "${tournament.title}"? (on your opinion)`;
            const result = await this.notificationService.sendPoll(
        tournament.telegram!.chatId,
        question,
        players,
        { reply_to_message_id: tournament.telegram!.messageId, is_anonymous: false },
            );

            await this.tournamentService.createPoll(
                tournament._id,
                {
                    id: result.poll.id,
                    chatId: result.chat.id,
                    messageId: result.message_id,
                    question,
                    answers,
                    closed: result.poll.is_closed,
                    results: {},
                },
            );

            const info = `
◦ <i>Only tournament's players can vote. Another votes will be ignored</i>

◦ <i>"Yourself voting" will be ignored</i>

◦ <i>Votes to win: ${this.getMinimumVotes(answers)}</i>
      `;

            await this.notificationService.send(
          tournament.telegram!.chatId,
          info,
          { reply_to_message_id: result.message_id, parse_mode: 'HTML', disable_notification: true },
            );
        });
    }

    @OnEvent('notification.poll_answer')
    async handlePollAnswer({ ctx, user }: NotificationMessage<'poll_answer'> & { user: UserEntity }) {
        const pollId = ctx.pollAnswer.poll_id;
        // const [answerId] = ctx.pollAnswer.option_ids;
        // const tournament = await this.tournamentService.votePoll(pollId, user._id, answerId);

        const p: { id: ObjectId, answerId: number }[] = [
            {
                id: new ObjectId('6156d2243a12c500166d99db'),
                answerId: 1,
            },
            {
                id: new ObjectId('6156d2563a12c500166d99e0'),
                answerId: 4,
            },
            {
                id: new ObjectId('6156d22c3a12c500166d99dc'),
                answerId: 4,
            },
            {
                id: new ObjectId('6156d2433a12c500166d99de'),
                answerId: 1,
            },
            {
                id: new ObjectId('6156d28a3a12c500166d99e2'),
                answerId: 4,
            },
            {
                id: new ObjectId('6156d2393a12c500166d99dd'),
                answerId: 1,
            },
            {
                id: user._id,
                answerId: ctx.pollAnswer.option_ids[0],
            },
        ];
        let tournament;

        // eslint-disable-next-line no-restricted-syntax
        for (const { id, answerId } of p) {
            // eslint-disable-next-line no-await-in-loop
            tournament = await this.tournamentService.votePoll(pollId, id, answerId);
        }

        if (!tournament || !tournament.poll) {
            this.logger.error(`Tournament by poll.id ${pollId} not found`);

            return;
        }

        const filteredResults: {[key: string]: ObjectId[]} = this.filterResults(tournament.poll.results, tournament.poll.answers);
        const resultsWithAutovotes: {[key: string]: ObjectId[]} = this.filterResults(tournament.poll.results, tournament.poll.answers, true);
        const minimumVotes = this.getMinimumVotes(tournament.poll.answers);
        const maximumVotes = this.getMaximumVotes(tournament.poll.answers);
        const totalVotes = this.getTotalVotes(resultsWithAutovotes);
        const currentWinner = this.getCurrentWinner(filteredResults, tournament.poll.answers);
        const player = (tournament.players[0] as unknown as UserEntity[]).find(({ _id }: UserEntity) => _id.equals(currentWinner.data));

        if (currentWinner.votes >= minimumVotes && player) {
            const respects = await this.tournamentService.getRespectedCount(player._id);
            const avatarUrl = await this.notificationService.updateAvatar(player);
            const users = await this.userService.getUsers(filteredResults[currentWinner.index]);
            const html = respectedPlayerTemplate({
                name: player.name,
                avatarUrl,
                respects,
            });
            const caption = `
${player.name} is MVP! Congratulations!

Players who voted: <b>${users.map(({ name }: UserEntity) => name).join(', ')}</b>
      `;

            await Promise.all([
                this.notificationService.sendHtml(
                    tournament.poll.chatId,
                    html,
                    { reply_to_message_id: tournament.poll.messageId, caption, parse_mode: 'HTML' },
                    { duration: 1000 * 5, viewport: { width: 1800, height: 850 }, delay: 2000 },
                ),
                this.notificationService.closePoll(tournament.poll.chatId, tournament.poll.messageId),
                this.statisticService.updateTournamentStat(currentWinner.data, false, true),
                this.tournamentService.setRespected(tournament._id, currentWinner.data),
            ]);

            return;
        }

        if (currentWinner.votes + maximumVotes - totalVotes < minimumVotes) {
            await Promise.all([
                this.notificationService.send(
                    tournament.poll.chatId,
                    'Nobody got enough votes :(',
                    { reply_to_message_id: tournament.poll.messageId },
                ),
                this.notificationService.closePoll(tournament.poll.chatId, tournament.poll.messageId),
                this.tournamentService.setRespected(tournament._id, null),
            ]);
        }
    }
}
