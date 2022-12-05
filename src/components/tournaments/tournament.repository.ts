import { StringObjectId } from '@components/common/types/string-objectid.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

    create(tournament: CreateTournamentDto) {
        return this.tournamentModel.create(tournament);
    }

    getAll({ skip, limit, status }: any = { skip: 0, limit: 0 }) {
        return this.tournamentModel
            .find({ status })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async getById(id: StringObjectId) {
        const tournament = this.tournamentModel.findById(id);

        if (!tournament) throw new Error('Tournament not found');

        return tournament;
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
}
