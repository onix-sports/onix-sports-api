import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import userConstants from '@components/v1/users/user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import statisticsConstants from '../statistics-constants';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: statisticsConstants.models.fakeStatistics,
    strict: true,
})
export class FakeStatistic {
    @ApiProperty()
    @Prop({ default: 0 })
    mGoals: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    rGoals: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    goals: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    amGoals: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    arGoals: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    aGoals: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    blueWon: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    redWon: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    won: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    blueGames: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    redGames: Number;

    @ApiProperty()
    @Prop({ default: 0 })
    games: Number;

    @ApiProperty()
    @Prop({ required: true, ref: userConstants.models.users })
    user: ObjectId;

    @ApiProperty()
    @Prop()
    name: String;

    @ApiProperty()
    @Prop({ default: false })
    enabled: Boolean;
}

export type FakeStatisticEntity = FakeStatistic & Document;

export const FakeStatisticSchema = SchemaFactory.createForClass(FakeStatistic);
