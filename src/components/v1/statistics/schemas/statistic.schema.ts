import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import userConstants from '@components/v1/users/user-constants';
import gamesConstants from '@components/v1/games/games-constants';
import { Teams } from '@components/v1/games/enum/teams.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TournamentConstants } from '@components/v1/tournaments/tournament.constants';
import { organizationsConstants } from '@components/v1/organizations/organizations.constants';
import statisticsConstants from '../statistics-constants';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: statisticsConstants.models.statistics,
    strict: true,
})
export class Statistic {
    @Prop({ type: Number, default: 0 })
    mGoals: Number;

    @Prop({ type: Number, default: 0 })
    rGoals: Number;

    @Prop({ type: Number, default: 0 })
    amGoals: Number;

    @Prop({ type: Number, default: 0 })
    arGoals: Number;

    @Prop({ type: Boolean, required: true })
    won: Boolean;

    @Prop({ type: ObjectId, ref: gamesConstants.models.games })
    game: ObjectId;

    @Prop({ type: ObjectId, ref: TournamentConstants.models.tournaments })
    tournament: ObjectId;

    @Prop({ type: ObjectId, required: true, ref: userConstants.models.users })
    user: ObjectId;

    @Prop({ type: typeof Teams, required: true, enum: Teams })
    team: Teams;

    @Prop({ required: true })
    enemy: ObjectId[];

    @Prop({ required: true })
    teammate: ObjectId;

    @Prop({ ref: organizationsConstants.models.organizations })
    organization: ObjectId;
}

export type StatisticEntity = Statistic & Document;

export const StatisticSchema = SchemaFactory.createForClass(Statistic);
