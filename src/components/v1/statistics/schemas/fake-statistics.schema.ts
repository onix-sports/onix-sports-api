import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import userConstants from '@components/v1/users/user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import statisticsConstants from '../statistics-constants';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: statisticsConstants.models.fakeStatistics,
    strict: true,
})
export class FakeStatistic {
  @Prop({ default: 0 })
      mGoals: Number;

  @Prop({ default: 0 })
      rGoals: Number;

  @Prop({ default: 0 })
      goals: Number;

  @Prop({ default: 0 })
      amGoals: Number;

  @Prop({ default: 0 })
      arGoals: Number;

  @Prop({ default: 0 })
      aGoals: Number;

  @Prop({ default: 0 })
      blueWon: Number;

  @Prop({ default: 0 })
      redWon: Number;

  @Prop({ default: 0 })
      won: Number;

  @Prop({ default: 0 })
      blueGames: Number;

  @Prop({ default: 0 })
      redGames: Number;

  @Prop({ default: 0 })
      games: Number;

  @Prop({ required: true, ref: userConstants.models.users })
      user: ObjectId;

  @Prop()
      name: String;

  @Prop({ default: false })
      enabled: Boolean;
}

export type FakeStatisticEntity = FakeStatistic & Document;

export const FakeStatisticSchema = SchemaFactory.createForClass(FakeStatistic);
