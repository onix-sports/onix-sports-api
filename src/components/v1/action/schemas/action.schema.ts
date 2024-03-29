import { ActionType } from '@components/v1/games/enum/action-type.enum';
import gamesConstants from '@components/v1/games/games-constants';
import userConstants from '@components/v1/users/user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

@Schema({
    versionKey: false,
    timestamps: true,
})
export class Action {
    @Prop()
    type: ActionType;

    @Prop({ ref: userConstants.models.users, required: false })
    player: ObjectId;

    @Prop()
    time: Date;

    @Prop()
    timeFromStart: Number;

    @Prop({ type: Object })
    info: any;

    @Prop({ ref: gamesConstants.models.games })
    game: ObjectId;
}

export type ActionDocument = Action & Document;

export const ActionSchema = SchemaFactory.createForClass(Action);
