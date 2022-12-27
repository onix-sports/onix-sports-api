import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from "mongodb";

import userConstants from "@components/users/user-constants";

@Schema({ timestamps: true })
export class StoryComment {
    @Prop({
        type: String,
        required: true
    })
    comment!: string;

    @Prop({ ref: userConstants.models.users, required: true })
    user!: ObjectId;
}

export const StoryCommentSchema = SchemaFactory.createForClass(StoryComment).set('versionKey', false);
