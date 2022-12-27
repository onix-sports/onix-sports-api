import { Document, Schema as MongooseSchema } from 'mongoose';
import { ObjectId } from "mongodb";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import userConstants from "@components/users/user-constants";

import { storiesConstants } from '../stories-constants';
import { StoryTypeEnum } from '../enums/story-type.enum';
import { StoryEmoji, StoryEmojiSchema } from './story-emojis.schema';
import { StoryComment, StoryCommentSchema } from './story-comments.schema';

@Schema({
  versionKey: false,
  timestamps: true,
  strict: false,
  collection: storiesConstants.models.stories,
})
export class Story {
  @Prop({ type: typeof StoryTypeEnum, enum: StoryTypeEnum, required: true })
  type: StoryTypeEnum = StoryTypeEnum.memes;


  @Prop({
    type: [StoryEmojiSchema],
    required: false,
    default: [],
  })
  emojis!: StoryEmoji[];

  @Prop({
    type: [StoryCommentSchema],
    required: false,
    default: [],
  })
  comments!: StoryComment[];


  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  content: any;

  @Prop({ ref: userConstants.models.users, default: [] })
  readBy: ObjectId[] = [];
};

export type StoryEntity = Story & Document;

export const StorySchema = SchemaFactory.createForClass(Story);
