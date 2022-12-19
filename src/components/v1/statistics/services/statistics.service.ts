import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';
import { GamesService } from '@components/v1/games/games.service';
import { Game } from '@components/v1/games/core/game.class';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import _ from 'lodash';
import { LeaderboardEntity } from '@components/v1/common/dto/leaderboard-entity.interface';
import { pipe } from '@components/v1/common/utils/pipe';
import { lessThan } from '@components/v1/common/utils/less-than';
import { GameStatus } from '@components/v1/games/enum/game-status.enum';
import { Action } from '@components/v1/games/core/action.class';
import { Player } from '@components/v1/games/core/player.class';
import { UserEntity } from '@components/v1/users/schemas/user.schema';
import { ProfileStatistic } from '../schemas/profile-statistics.schema';
import { ProfileStatisticsRepository } from '../repositories/profile-statistics.repository';
import sortByScore from '../helpers/sort-by-score.helper';
import { FakeStatisticsService } from './fake-statistics.service';
import StatisticsRepository from '../repositories/statistics.repository';

const MINIMUM_GAMES = 20;
const WEAK_SEASSON_MINIMUM_GAMES = 0;

@Injectable()
export class StatisticsService {
    constructor(
    private readonly statisticRepository: StatisticsRepository,
    private readonly gameService: GamesService,
    private readonly fakeStatisticService: FakeStatisticsService,
    private readonly profileStatisticsRepository: ProfileStatisticsRepository,
    private readonly eventEmiter: EventEmitter2,
    ) {}

  @OnEvent('games.finished', { async: true })
    public async saveStats({ game, info }: { game: Game, info: GameInfo }) {
        const getTeammate = (players: Player[], index: number) => {
            if (index === 0) {
                return players[1];
            }

            if (index === 1) {
                return players[0];
            }

            if (index === 2) {
                return players[3];
            }

            return players[2];
        };
        const stats = info.players.map((player, index, players) => ({
            user: player._id,
            mGoals: player.mGoals,
            rGoals: player.rGoals,
            amGoals: player.amGoals,
            arGoals: player.arGoals,
            team: player.team,
            won: player.team === info.winner,
            game: new ObjectId(info.id),
            tournament: info.tournament,
            teammate: getTeammate(players, index),
            enemy: index < 2 ? players.slice(2) : players.slice(0, 2),
        })).map((stat) => ({
            ...stat,
            teammate: new ObjectId(stat.teammate._id),
            enemy: [new ObjectId(stat.enemy[0]._id), new ObjectId(stat.enemy[1]._id)],
        }));

        const _stats = await this.statisticRepository.create(stats);

        await this.gameService.pushStats(new ObjectId(game.id), _stats.map(({ _id }) => _id));

        const promises = info.players.map(async (player) => {
            const games = await this.gameService.getGames(
                { players: player._id, status: GameStatus.FINISHED },
                undefined,
                undefined,
                { duration: -1 },
            );
            const longestGame = games[0];
            const shortestGame = games[games.length - 1];

            const stats = await this.statisticRepository.getByPlayer(player._id);
            const won = stats.reduce((acc, val) => (acc + (val.won ? 1 : 0)), 0);

            return this.profileStatisticsRepository.updateGameStat(player._id, {
                mGoals: player.mGoals,
                rGoals: player.rGoals,
                amGoals: player.amGoals,
                arGoals: player.arGoals,
                won: player.team === info.winner,
                totalTime: info.duration,
                longestGame: longestGame._id,
                shortestGame: shortestGame._id,
                gameId: new ObjectId(info.id),
                winrate: won / stats.length,
                ...this.calculatePositionsTimes(player._id, info.actions as Action[]),
            });
        });

        await Promise.all(promises);

        return _stats;
    }

  public updateTournamentStat = this.profileStatisticsRepository.updateTournamentStat.bind(this.profileStatisticsRepository);

  private calculatePositionsTimes(user: ObjectId, actions: Action[]) {
      return actions.reduce((acc, action, index) => {
          const { position, team } = action.info.players.find((player: Player) => player._id.toString() === user.toString());

          if (index === 0) {
              acc.currentPosition = position;

              return acc;
          }

          if (action.type !== 'RESUME') {
              acc[acc.currentPosition === 'forward' ? 'forwardTime' : 'keeperTime'] += action.timeFromStart - acc.timeFromStart;
          }

          if (
              ['RGOAL', 'MGOAL'].includes(action.type)
        && acc.currentPosition === 'goalkeeper'
        && action.player!.team !== team) {
              acc.goalsSkipped += 1;
          }

          acc.timeFromStart = action.timeFromStart;
          acc.currentPosition = position;

          return acc;
      }, {
          keeperTime: 0, forwardTime: 0, currentPosition: 'goalkeeper', timeFromStart: 0, goalsSkipped: 0,
      });
  }

  public getStatsPeriod(ids?: ObjectId[], dateFrom?: Date, dateTo?: Date) {
      return this.statisticRepository.getStatsPeriod(ids, dateFrom, dateTo);
  }

  public getTournamentStats(id: ObjectId) {
      return this.statisticRepository.getTournament(id);
  }

  public getLastGames(ids: ObjectId[], count: Number) {
      return this.statisticRepository.getLastGames(ids, count);
  }

  public async getTournamentPerform(id: ObjectId) {
      const stats = await this.statisticRepository.getTournament(id);

      const goals = [...stats]
          .sort((b, a) => (+a.goals / a.games) - (+b.goals / b.games) || (a.won / a.games) - (b.won / b.games));

      const totalGoals = stats.reduce((acc, val) => acc + val.goals, 0);

      return {
          goals,
          totalGoals,
      };
  }

  public async getTeamsWinChance(teams: any[][], gamesCount: Number) {
      const stats = await this.statisticRepository.getLastGames(teams.flat().map(({ _id }: any) => _id), gamesCount);

      const winrates = teams.map(([p1, p2]: any[]) => {
          const stat1 = _.find(stats, ({ _id }: any) => _id.equals(p1._id)) || { won: 1, games: 2 };
          const stat2 = _.find(stats, ({ _id }: any) => _id.equals(p2._id)) || { won: 1, games: 2 };

          const wr = (stat1.won / stat1.games + stat2.won / stat2.games) / 2;

          return { player1: p1, player2: p2, winrate: wr };
      });

      const lowestWinrate = Math.min(...winrates.map(({ winrate }: any) => winrate));
      const coefs = winrates.map(({ player1, player2, winrate }) => ({ player1, player2, coef: winrate / lowestWinrate }));
      const sumOfCoefs = coefs.reduce((acc, val) => acc + val.coef, 0);
      const amount = 100 / sumOfCoefs;

      const chances = coefs.map(({ player1, player2, coef }) => ({ player1, player2, chance: coef * amount }));

      return chances;
  }

  private filterByGames(games: number) {
      return (player: LeaderboardEntity) => player.games >= games;
  }

  private averageGameCount(players: LeaderboardEntity[]) {
      return players.reduce((acc, val, index, array) => acc + val.games / array.length, 0);
  }

  private filterBySeassonMinimumGames(isWeak: boolean) {
      return this.filterByGames(isWeak ? WEAK_SEASSON_MINIMUM_GAMES : MINIMUM_GAMES);
  }

  private filterGuests(player: LeaderboardEntity) {
      return !player.isGuest;
  }

  public isWeakSeasson = pipe(
      this.averageGameCount,
      lessThan(MINIMUM_GAMES),
  );

  public filterParticipiants = pipe(
      this.isWeakSeasson,
      this.filterBySeassonMinimumGames.bind(this),
  );

  public calculateMaxScore(players: LeaderboardEntity[]) {
      return players.filter(this.filterGuests).length * 2;
  }

  public async getLeaderboard(dateFrom?: Date, dateTo?: Date): Promise<LeaderboardEntity[]> {
      let stats = await this.statisticRepository.getStatsPeriod([], dateFrom, dateTo);
      const fakeStats = await this.fakeStatisticService.getStats();

      stats = stats.map((stat) => {
          return fakeStats.find(({ user }) => user.equals(stat._id)) || stat;
      });

      const users = stats.map(({
          rGoals, mGoals, games, won, _id, name,
      }) => {
          const gpg = (rGoals * 1.2 + mGoals) / (games || 1);
          const winrate = (won / (games || 1)) * 100;

          return {
              gpg, winrate, games, _id, name, isGuest: false,
          };
      });

      const participiants = users.filter(this.filterParticipiants(users));
      const guests = users
          .filter(({ _id }) => !participiants.find(({ _id: id }) => id.equals(_id)))
          .map((guest) => ({
              ...guest,
              wScore: 0,
              gScore: 0,
              score: 0,
              isGuest: true,
          }));

      return [...sortByScore(participiants), ...guests];
  }

  public getEnemies(player: ObjectId, enemies: ObjectId[], games: Number = 20) {
      return this.statisticRepository.getEnemies(player, enemies, games);
  }

  public getTeammates(player: ObjectId, teammates: ObjectId[], games: Number = 20) {
      return this.statisticRepository.getTeammates(player, teammates, games);
  }

  public async getProfileStats(id: ObjectId) {
      const _stats = await this.profileStatisticsRepository.getByUserId(id);

      if (!_stats) {
          throw new NotFoundException('Profile statistics not found');
      }

      /** Temp solution */
      const [avatar] = await this.eventEmiter.emitAsync('telegram.updateAvatar', _stats.user);

      if (avatar) {
          (_stats.user as unknown as UserEntity).avatarUrl = avatar;
      }

      const stats: ProfileStatistic & { gpg: number, winrate: number, keepTime: number } = {
          gpg: _stats.goals / _stats.games,
          winrate: _stats.won / _stats.games,
          keepTime: _stats.keeperTime / _stats.goalsSkipped,
          ..._stats as unknown as ProfileStatistic,
      };

      return stats;
  }

  @OnEvent('user.created', { async: true })
  public onUserCreated(user: UserEntity) {
      return this.profileStatisticsRepository.createDefault(user._id);
  }
}
