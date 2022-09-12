import { GameInfo } from '@components/games/core/interfaces/game-info.interface';
import { GamesService } from '@components/games/games.service';
import { Game } from '@components/games/core/game.class';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import StatisticsRepository from './statistics.repository';
import _ from 'lodash';
import { FakeStatisticsService } from './fake-statistics.service';
import sortByScore from './helpers/sort-by-score.helper';
import { LeaderboardEntity } from '@components/common/interfaces/leaderboard-entity.interface';
import { pipe } from '@components/common/utils/pipe';
import { lessThan } from '@components/common/utils/less-than';

const MINIMUM_GAMES = 20;
const WEAK_SEASSON_MINIMUM_GAMES = 0;

@Injectable()
export class StatisticsService {
  constructor(
    private readonly statisticRepository: StatisticsRepository,
    private readonly gameService: GamesService,
    private readonly fakeStatisticService: FakeStatisticsService,
  ) {}

  @OnEvent('games.finished', { async: true })
  public async saveStats({ game, info }: { game: Game, info: GameInfo }) {
    const stats = info.players.map((player, index, players) => ({
      user: player._id,
      mGoals: player.mGoals,
      rGoals: player.rGoals,
      amGoals: player.amGoals,
      arGoals: player.arGoals,
      team: player.team,
      won: player.team == info.winner,
      game: new ObjectId(info.id),
      tournament: info.tournament,
      teammate: index === 0 ? players[1] : index === 1 ? players[0] : index === 2 ? players[3] : players[2], 
      enemy: index < 2 ? players.slice(2) : players.slice(0, 2),
    })).map((stat) => ({
      ...stat,
      teammate: new ObjectId(stat.teammate._id),
      enemy: [new ObjectId(stat.enemy[0]._id), new ObjectId(stat.enemy[1]._id)],
    }));

    const _stats = await this.statisticRepository.create(stats);

    await this.gameService.pushStats(new ObjectId(game.id), _stats.map(({_id}) => _id));

    return _stats;
  }

  public getStatsPeriod(ids: ObjectId[], dateFrom?: Date, dateTo?: Date) {
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
      totalGoals
    };
  }

  public async getTeamsWinChance(teams: any[][], gamesCount: Number) {
    const stats = await this.statisticRepository.getLastGames(teams.flat().map(({_id}: any) => _id), gamesCount);

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
  )

  public filterParticipiants = pipe(
      this.isWeakSeasson,
      this.filterBySeassonMinimumGames.bind(this),
  )

  public calculateMaxScore(players: LeaderboardEntity[]) {
    return players.filter(this.filterGuests).length * 2;
  }

  public async getLeaderboard(dateFrom?: Date, dateTo?: Date): Promise<LeaderboardEntity[]> {
    let stats = await this.statisticRepository.getStatsPeriod([], dateFrom, dateTo);
    const fakeStats = await this.fakeStatisticService.getStats(stats.map(({ _id }) => new ObjectId(_id)));

    stats = stats.map((stat) => {
      return fakeStats.find(({ user }) => user.equals(stat._id)) || stat;
    })

    const users = stats.map(({ rGoals, mGoals, games, won, _id, name }) => {
      const gpg = (rGoals * 1.2 + mGoals) / (games || 1);
      const winrate = won / (games || 1) * 100;

      return { gpg, winrate, games, _id, name, isGuest: false };
    });

    const participiants = users.filter(this.filterParticipiants(users));
    const guests = users
      .filter(({ _id }) => !participiants.find(({ _id: id }) => id.equals(_id)))
      .map((guest) => ({
        ...guest,
        wScore: '-',
        gScore: '-',
        score: '-',
        isGuest: true
      }));

    return [...sortByScore(participiants), ...guests];
  }

  public getEnemies(player: ObjectId, enemies: ObjectId[], games: Number = 20) {
    return this.statisticRepository.getEnemies(player, enemies, games);
  }

  public getTeammates(player: ObjectId, teammates: ObjectId[], games: Number = 20) {
    return this.statisticRepository.getTeammates(player, teammates, games);
  }
}
