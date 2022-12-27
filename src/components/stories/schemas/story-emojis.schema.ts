import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from "mongodb";

import userConstants from "@components/users/user-constants";

@Schema({ timestamps: true })
export class StoryEmoji {
    @Prop({
        type: String,
        required: true
    })
    emoji!: string;

    @Prop({ ref: userConstants.models.users, required: true })
    user!: ObjectId;
}

export const StoryEmojiSchema = SchemaFactory.createForClass(StoryEmoji).set('versionKey', false);
