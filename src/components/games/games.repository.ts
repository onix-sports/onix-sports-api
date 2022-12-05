import { InjectModel } from '@nestjs/mongoose';
import {
    FilterQuery, Model, UpdateQuery, UpdateWithAggregationPipeline,
} from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import statisticsConstants from './games-constants';
import { GameEntity } from './schemas/game.schema';
import CreateGameDto from './dto/create-game.dto';

@Injectable()
export default class GamesRepository {
    constructor(
    @InjectModel(statisticsConstants.models.games)
    private readonly gameModel: Model<GameEntity>,
    ) {}

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

        if (!game) throw new Error('Game was not found');

        return game;
    }

    async getGames(query: FilterQuery<GameEntity>, limit: number, skip: number, sort: any = {}) {
        return this.gameModel.find(query, {}, { sort }).skip(skip).limit(limit).populate('players', { name: 1, _id: 1 });
    }
}
