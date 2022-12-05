import { ActionType } from '@components/games/enum/action-type.enum';
import gamesConstants from '@components/games/games-constants';
import userConstants from '@components/users/user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
    versionKey: false,
    timestamps: true,
})
export class Action {
  @Prop()
      type: ActionType = ActionType.MGOAL;

  @Prop({ ref: userConstants.models.users, required: false })
      player: ObjectId = new ObjectId();

  @Prop()
      time: Date = new Date();

  @Prop()
      timeFromStart: Number;

  @Prop({ type: Object })
      info: any;

  @Prop({ ref: gamesConstants.models.games })
      game: ObjectId = new ObjectId();
}

export type ActionDocument = Action & Document;

export const ActionSchema = SchemaFactory.createForClass(Action);
