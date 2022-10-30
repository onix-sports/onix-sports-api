import gamesConstants from "@components/games/games-constants";
import userConstants from "@components/users/user-constants";
import { TournamentConstants as tournamentConstants} from "../tournament.constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ObjectId } from "mongodb";
import { TournamentStatus } from "../enum/tour-status.enum";
import { TournamentType } from "../enum/tour-type.enum";

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
  @Prop({ default: 'Tournament' })
  title: string = '';

  @Prop({ ref: userConstants.models.users, default: [] })
  players: ObjectId[] = [];

  @Prop({ ref: gamesConstants.models.games, default: [] })
  games: ObjectId[] = [];

  @Prop({ default: TournamentStatus.OPENED })
  status: TournamentStatus;

  @Prop({ required: false })
  type: TournamentType;

  @Prop({})
  best: Types.ObjectId;

  @Prop({ type: {} as Poll | null, default: null })
  poll: Poll | null;

  @Prop({ type: {} as Types.ObjectId | null, default: null })
  respected: Types.ObjectId | null;

  @Prop({ type: {} as Poll | null, default: null })
  telegram: TelegramData | null;
};

export type TournamentDocument = Tournament & Document;

export const TournamentSchema = SchemaFactory.createForClass<Tournament>(Tournament);

TournamentSchema.pre('save', async function (next) {
  const title = Reflect.get(this, 'title');

  if (title === tournamentConstants.defaults.tournaments.title) {
    const count = await this.collection.countDocuments() + 1;

    Reflect.set(this, 'title', `${tournamentConstants.defaults.tournaments.title} #${count}`);
  }

  next();
});
