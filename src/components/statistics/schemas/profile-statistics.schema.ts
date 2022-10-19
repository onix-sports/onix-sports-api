import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import statisticsConstants from '../statistics-constants';
import gamesConstants from '@components/games/games-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import userConstants from '@components/users/user-constants';

@Schema({
  versionKey: false,
  timestamps: true,
  collection: statisticsConstants.models.profileStatistics,
  strict: true,
})
export class ProfileStatistic {
  @Prop({ required: true, ref: userConstants.models.users })
  user: ObjectId;

  @Prop({ default: 0 })
  goals: number;

  @Prop({ default: 0 })
  mGoals: number;

  @Prop({ default: 0 })
  rGoals: number;

  @Prop({ default: 0 })
  aGoals: number;

  @Prop({ default: 0 })
  arGoals: number;

  @Prop({ default: 0 })
  amGoals: number;

  @Prop({ default: 0 })
  won: number;

  @Prop({ default: 0 })
  games: number;

  @Prop({ default: 0 })
  totalTime: number;

  @Prop({ default: [] })
  goalsLine: Array<number>;

  @Prop({ default: [] })
  winrateLine: Array<number>;

  @Prop({ ref: gamesConstants.models.games, default: [] })
  lastGames: Array<ObjectId>;

  @Prop({ default: 0 })
  best: number;

  @Prop({ ref: gamesConstants.models.games, default: null })
  longestGame: ObjectId;

  @Prop({ ref: gamesConstants.models.games, default: null})
  shortestGame: ObjectId;

  @Prop({ default: 0 })
  keeperTime: number;

  @Prop({ default: 0 })
  forwardTime: number;

  @Prop({ default: 0 })
  goalsSkipped: number;
};

export type ProfileStatisticEntity = ProfileStatistic & Document;

export const ProfileStatisticSchema = SchemaFactory.createForClass(ProfileStatistic);
