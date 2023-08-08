import { StringObjectId } from '@components/v1/common/types/string-objectid.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {
    FilterQuery, Model, UpdateQuery, UpdateWithAggregationPipeline,
} from 'mongoose';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentDocument } from './schemas/tournament.schema';
import { TournamentConstants } from './tournament.constants';

@Injectable()
export class TournamentRepository {
    constructor(
    @InjectModel(TournamentConstants.models.tournaments)
    private readonly tournamentModel: Model<TournamentDocument>,
    ) {}

    create(tournament: CreateTournamentDto & { creator: ObjectId, moderator: ObjectId }) {
        return this.tournamentModel.create(tournament);
    }

    getAll({ skip, limit, ...query }: any = { skip: 0, limit: 0 }) {
        return this.tournamentModel
            .find({
                ...query,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    get(query: FilterQuery<TournamentDocument>) {
        return this.tournamentModel.find(query);
    }

    async getById(id: ObjectId) {
        const tournament = await this.tournamentModel.findById(id).populate('players');

        if (!tournament) throw new Error('Tournament not found');

        return tournament;
    }

    getTournamentByCreator(_id: ObjectId, creator: ObjectId) {
        return this.tournamentModel.findOne({ _id, creator });
    }

    getTournamentByOrganizations(_ids: ObjectId[], organizations: ObjectId[]) {
        return this.tournamentModel.find({ _id: { $in: _ids }, organization: { $in: organizations } });
    }

    removeGame(_id: ObjectId, gameId: ObjectId) {
        return this.tournamentModel.findOneAndUpdate({ _id }, { $pull: { games: gameId } }, { new: true }).populate('games');
    }

    updateById(id: StringObjectId, update: UpdateWithAggregationPipeline | UpdateQuery<TournamentDocument>) {
        return this.tournamentModel.findByIdAndUpdate(id, update).populate('players');
    }

    updateOne(filter: FilterQuery<TournamentDocument>, update: UpdateWithAggregationPipeline | UpdateQuery<TournamentDocument>) {
        return this.tournamentModel.findOneAndUpdate(filter, update, { new: true }).populate('players');
    }

    countDocuments(filter: FilterQuery<TournamentDocument>) {
        return this.tournamentModel.countDocuments(filter);
    }

    deleteById(id: ObjectId) {
        return this.tournamentModel.findByIdAndDelete(id);
    }

    changeModerator(tournament: ObjectId, currentModerator: ObjectId, moderator: ObjectId) {
        return this.tournamentModel.updateOne({ _id: tournament, moderator: currentModerator }, { moderator });
    }
}
