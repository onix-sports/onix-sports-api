import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import { Game } from './core/game.class';
import { Teams } from './enum/teams.enum';
import GamesRepository from './games.repository';
import { GameInfo } from './core/interfaces/game-info.interface';
import { GameStatus } from './enum/game-status.enum';
import { UserEntity } from '../users/schemas/user.schema';

@Injectable()
export class GameProcessService {
    constructor(
    private readonly gameRepository: GamesRepository,
    private readonly eventEmitter: EventEmitter2,
    ) {
        Game.emitter.on('finish', async ({ info, gameId }: { info: GameInfo, gameId: ObjectId }) => {
            await Promise.all([
                this._finish(info),
                this.gameRepository.delete(gameId),
            ]);
        });
    }

    get emitter() {
        return Game.emitter;
    }

    private async getGame(id: ObjectId) {
        const game = await this.gameRepository.get(id);

        if (!game) throw new BadRequestException('Game was not found');

        return game;
    }

    public async start(id: ObjectId) {
        const {
            players,
            title,
            status,
            tournament,
        } = await this.gameRepository.getGameInfo(id);

        if (status !== GameStatus.DRAFT) throw new BadRequestException('Game is already finished or started!');

        const game: Game = new Game({
            id,
            players: Game.wrapPlayers(players as any as UserEntity[]),
            title,
            tournament,
        }).start();

        await this.gameRepository.save(id, game);
    }

    public async finish(id: ObjectId) {
        const game: Game = await this.getGame(id);

        const info = game
            .finish()
            .info();

        await this.gameRepository.save(id, game);

        return info;
    }

    public async goal(id: ObjectId, playerId: ObjectId, enemyId: ObjectId) {
        const game: Game = await this.getGame(id);

        const info = game
            .goal(playerId, enemyId)
            .info();

        await this.gameRepository.save(id, game);

        return info;
    }

    public async info(id: ObjectId) {
        const game: Game = await this.getGame(id);

        return game.info();
    }

    public async pause(id: ObjectId) {
        const game = await this.getGame(id);

        if (game.info().status === GameStatus.PAUSED) {
            game.unpause();
        } else if (game.info().status !== GameStatus.DRAFT) {
            game.pause();
        }

        await this.gameRepository.save(id, game);

        return game.info();
    }

    public async swap(id: ObjectId, playerId: ObjectId) {
        const game: Game = await this.getGame(id);

        const info = game
            .swap(playerId)
            .info();

        await this.gameRepository.save(id, game);

        return info;
    }

    public async cancel(id: ObjectId, actionId: ObjectId) {
        const game = await this.getGame(id);

        const info = game
            .cancel(actionId)
            .info();

        await this.gameRepository.save(id, game);

        return info;
    }

    private async _finish(info: GameInfo) {
        await this.saveGame(info.id, info);
        await this.eventEmitter.emitAsync('game.finished', { id: info.id, info });

        this.emitter.emit('finished', { id: info.id, info });

        await this.eventEmitter.emitAsync('game.finished.after', { id: info.id, info });
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
            },
        });
    }
}
