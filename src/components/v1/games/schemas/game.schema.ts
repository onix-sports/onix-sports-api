import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import statisticsConstants from '@components/v1/statistics/statistics-constants';
import userConstants from '@components/v1/users/user-constants';
import { TournamentConstants } from '@components/v1/tournaments/tournament.constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from '../enum/game-status.enum';
import { Teams } from '../enum/teams.enum';
import gameConstants from '../games-constants';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: gameConstants.models.games,
})
export class Game {
    @ApiProperty()
    @Prop({ type: String, default: '' })
    title: String;

    @ApiProperty()
    @Prop({ type: [ObjectId], required: true, ref: userConstants.models.users })
    players: ObjectId[];

    @ApiProperty()
    @Prop({ type: [ObjectId], ref: statisticsConstants.models.statistics })
    stats: ObjectId[];

    @ApiProperty()
    @Prop({ type: typeof Teams, enum: Teams })
    winner: Teams;

    @ApiProperty()
    @Prop({ type: typeof GameStatus, default: GameStatus.DRAFT, enum: GameStatus })
    status: GameStatus;

    @ApiProperty()
    @Prop({ type: [ObjectId], default: [] })
    watchers: ObjectId[];

    @ApiProperty()
    @Prop({ type: [ObjectId], default: [] })
    actions: ObjectId[];

    @ApiProperty()
    @Prop({ type: Date })
    startedAt: Date;

    @ApiProperty()
    @Prop({ type: Date })
    finishedAt: Date;

    @ApiProperty()
    @Prop({ type: [Number] })
    score: Number[];

    @ApiProperty()
    @Prop({ type: Number, default: 0 })
    duration: Number;

    @ApiProperty()
    @Prop({ type: ObjectId, ref: TournamentConstants.models.tournaments })
    tournament: any;
}

export type GameEntity = Game & Document;

export const GameSchema = SchemaFactory.createForClass(Game);
