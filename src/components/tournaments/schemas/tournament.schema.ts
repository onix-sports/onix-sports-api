import gamesConstants from "@components/games/games-constants";
import userConstants from "@components/users/user-constants";
import { TournamentConstants as tournamentConstants} from "../tournament.constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, Types } from "mongoose";
import { TournamentStatus } from "../enum/tour-status.enum";
import { TournamentType } from "../enum/tour-type.enum";

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
