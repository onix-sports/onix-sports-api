import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from "mongodb";

import userConstants from "@components/users/user-constants";

@Schema({ timestamps: true })
export class StoryContent {
    @Prop({
        type: String,
        required: false
    })
    cover?: string;

    @Prop({
        type: String,
        required: false
    })
    title?: string;

    @Prop({
        type: String,
        required: false
    })
    text?: string;
}

export const StoryContentSchema = SchemaFactory.createForClass(StoryContent).set('versionKey', false);
