import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import statisticsConstants from '@components/v1/statistics/statistics-constants';
import userConstants from '@components/v1/users/user-constants';
import { TournamentConstants } from '@components/v1/tournaments/tournament.constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GameStatus } from '../enum/game-status.enum';
import { Teams } from '../enum/teams.enum';
import gameConstants from '../games-constants';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: gameConstants.models.games,
})
export class Game {
  @Prop({ type: String, default: '' })
      title: String;

  @Prop({ type: [ObjectId], required: true, ref: userConstants.models.users })
      players: ObjectId[];

  @Prop({ type: [ObjectId], ref: statisticsConstants.models.statistics })
      stats: ObjectId[];

  @Prop({ type: typeof Teams, enum: Teams })
      winner: Teams;

  @Prop({ type: typeof GameStatus, default: GameStatus.DRAFT, enum: GameStatus })
      status: GameStatus;

  @Prop({ type: [ObjectId], default: [] })
      watchers: ObjectId[];

  @Prop({ type: [ObjectId], default: [] })
      actions: ObjectId[];

  @Prop({ type: Date })
      startedAt: Date;

  @Prop({ type: Date })
      finishedAt: Date;

  @Prop({ type: [Number] })
      score: Number[];

  @Prop({ type: Number, default: 0 })
      duration: Number;

  @Prop({ type: ObjectId, ref: TournamentConstants.models.tournaments })
      tournament: any;
}

export type GameEntity = Game & Document;

export const GameSchema = SchemaFactory.createForClass(Game);
