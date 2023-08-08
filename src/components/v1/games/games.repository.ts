import { InjectModel } from '@nestjs/mongoose';
import {
    FilterQuery, Model, UpdateQuery, UpdateWithAggregationPipeline,
} from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import statisticsConstants from './games-constants';
import { GameEntity } from './schemas/game.schema';
import CreateGameDto from './dto/create-game.dto';
import { Game } from './core/game.class';
import { GameStatus } from './enum/game-status.enum';
import { Player } from './core/player.class';
import { Players } from './core/players-list.class';
import { Action } from './core/action.class';

@Injectable()
export default class GamesRepository {
    private readonly redisClient: Redis;

    constructor(
    @InjectModel(statisticsConstants.models.games)
    private readonly gameModel: Model<GameEntity>,
    private readonly redisService: RedisService,
    ) {
        this.redisClient = redisService.getClient();
    }

    async create(_games: CreateGameDto[]| CreateGameDto, select?: any) {
        const games = await this.gameModel.create(_games);

        return this.gameModel.populate(games, { path: 'players', select });
    }

    updateById(_id: any, update?: UpdateWithAggregationPipeline | UpdateQuery<GameEntity> | undefined) {
        return this.gameModel.findByIdAndUpdate(_id, update);
    }

    getActions(roomId: Number) {
        return this.gameModel.findOne({ roomId }).select('actions');
    }

    async getGameInfo(id: ObjectId | String) {
        const game = await this.gameModel.findById(id)
            .populate('players stats');

        if (!game) throw new NotFoundException('Game was not found');

        return game;
    }

    async getGames(query: FilterQuery<GameEntity>, limit: number, skip: number, sort: any = {}) {
        return this.gameModel.find(query, {}, { sort }).skip(skip).limit(limit).populate('players', { name: 1, _id: 1 });
    }

    deleteNotFinished(tournament: ObjectId) {
        return this.gameModel.deleteMany({ tournament, status: { $ne: GameStatus.FINISHED } });
    }

    deleteById(_id: ObjectId) {
        return this.gameModel.findOneAndDelete({ _id });
    }

    save(id: ObjectId, game: Game) {
        return this.redisClient.set(id.toString(), JSON.stringify(game));
    }

    get(id: ObjectId) {
        return this.redisClient.get(id.toString()).then((game) => {
            if (!game) throw new NotFoundException('Game was not found');

            const _game = JSON.parse(game);
            const players = _game.players.players.map((player: any) => new Player(player));

            _game.id = new ObjectId(_game.id);
            _game.tournament = new ObjectId(_game.tournament);
            _game.organization = new ObjectId(_game.organization);
            _game.moderator = new ObjectId(_game.moderator);
            _game.startedAt = _game.startedAt && new Date(_game.startedAt);
            _game.finishedAt = _game.finishedAt && new Date(_game.finishedAt);
            _game.lastPauseDate = _game.lastPauseDate && new Date(_game.lastPauseDate);
            _game.actions = _game.actions.map((action: any) => new Action(action));

            _game.players = new Players(players);

            return new Game(_game);
        });
    }

    delete(id: ObjectId) {
        return this.redisClient.del(id.toString());
    }

    changeModerator(tournament: ObjectId, moderator: ObjectId) {
        return this.gameModel.updateMany({ tournament, status: GameStatus.FINISHED }, { $set: { moderator } });
    }
}
