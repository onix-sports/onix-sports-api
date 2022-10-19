import { Injectable } from "@nestjs/common";
import { EventEmitter } from "stream";
import { Game } from "./core/game.class";
import { Teams } from "./enum/teams.enum";
import GamesRepository from "./games.repository";
import { gameEvent } from "./utils/event.util";
import { GameInfo } from "./core/interfaces/game-info.interface";
import { EventEmitter2 } from "eventemitter2";
import { GameStatus } from "./enum/game-status.enum";

@Injectable()
export class GameProcessService {
  constructor(
    private readonly gameRepository: GamesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private games: {[key: string]: Game} = {};
  private emiter: EventEmitter = new EventEmitter();

  get Emiter() {
    return this.emiter;
  }

  private appendGame(game: Game) {
    this.emiter.once(gameEvent(game.id, 'finish'), () => {
      this.eventEmitter.emit('game.finished', { id: game.id, info: game.info() });

      this.finish(game);
      this.removeGame(game.id);
    })

    this.games[game.id] = game;
  }

  private removeGame(id: any) {
    delete this.games[id];
  }

  private getGame(id: any) {
    const game = this.games[id];

    if (!game) throw new Error('Game was not found');

    return game;
  } 

  public async start(id: String) {
    const { players, title, status, tournament } = await this.gameRepository.getGameInfo(id);

    if (status !== GameStatus.DRAFT) throw new Error('Game is already finished or started!');

    const game: Game = Game.create({ 
      id, 
      teams: players,
      title,
      emitter: this.emiter,
      tournament
    });

    this.appendGame(game);

    await this.saveGame(id, game.info());
  }

  public goal(id: any, playerId: any, enemyId: any) {
    return this.getGame(id)
      .goal(playerId, enemyId)
      .info();
  }

  public info(id: any) {
    return this.getGame(id).info();
  }

  public async pause(id: any) {
    const game = this.getGame(id);

    if (game.info().status == GameStatus.PAUSED) {
      game.unpause();
    } else if (game.info().status != GameStatus.DRAFT) {
      game.pause();
    }

    await this.saveGame(id, game.info());

    return game.info();
  }

  public swap(id: any, playerId: any) {
    return this.getGame(id)
      .swap(playerId)
      .info();
  }

  public cancel(id: any, actionId: number) {
    return this.getGame(id)
      .cancel(actionId)
      .info();
  }

  private async finish(game: Game) {
    const info = game.info();

    await this.saveGame(game.id, info);
    await this.eventEmitter.emitAsync('games.finished', { game, info });

    this.emiter.emit('finished', { id: info.id, info });
  }

  private saveGame(id: any, info: GameInfo) {
    return this.gameRepository.updateById(id, {
      $set: {
        score: [info.score[Teams.red], info.score[Teams.blue]],
        status: info.status,
        winner: info.winner,
        startedAt: info.startedAt,
        finishedAt: info.finishedAt,
        duration: info.duration,
      }
    });
  }
}