import gamesConstants from '@components/v1/games/games-constants';
import userConstants from '@components/v1/users/user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { TournamentConstants as tournamentConstants } from '../tournament.constants';
import { TournamentStatus } from '../enum/tour-status.enum';
import { TournamentType } from '../enum/tour-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export type PollAnswer = {
  data: any;
  label: string;
}

export type Poll = {
  id: string;
  chatId: number;
  messageId: number;
  answers: PollAnswer[];
  question: string;
  results: {
    [key: string]: ObjectId[];
  },
  closed: boolean;
}

export type TelegramData = {
  chatId: number;
  messageId: number;
}

@Schema({
    versionKey: false,
    timestamps: true,
})
export class Tournament {
    @ApiProperty()
    @Prop({ default: 'Tournament' })
    title: string = '';

    @ApiProperty()
    @Prop({ ref: userConstants.models.users, default: [] })
    players: ObjectId[] = [];

    @ApiProperty()
    @Prop({ ref: gamesConstants.models.games, default: [] })
    games: ObjectId[] = [];

    @ApiProperty()
    @Prop({ default: TournamentStatus.OPENED })
    status: TournamentStatus;

    @ApiProperty()
    @Prop({ required: false })
    type: TournamentType;

    @ApiProperty()
    @Prop({})
    best: Types.ObjectId;

    @ApiProperty()
    @Prop({ type: {} as Poll | null, default: null })
    poll: Poll | null;

    @ApiProperty()
    @Prop({ type: {} as Types.ObjectId | null, default: null })
    respected: Types.ObjectId | null;

    @ApiProperty()
    @Prop({ type: {} as Poll | null, default: null })
    telegram: TelegramData | null;
}

export type TournamentDocument = Tournament & Document;

export const TournamentSchema = SchemaFactory.createForClass<Tournament>(Tournament);

TournamentSchema.pre('save', async function preSave(next) {
    const title = Reflect.get(this, 'title');

    if (title === tournamentConstants.defaults.tournaments.title) {
        const count = await this.collection.countDocuments() + 1;

        Reflect.set(this, 'title', `${tournamentConstants.defaults.tournaments.title} #${count}`);
    }

    next();
});
