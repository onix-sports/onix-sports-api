import { ObjectId } from "mongodb";
import { FilterQuery } from "mongoose";
import { CursorPageEnum } from "../enums/cursor-pagination-page.enum";

import { StoryTypeEnum } from '../enums/story-type.enum';
import { StoryEntity } from "../schemas/story.schema";

export interface ILastStoriesOpt {
    userId: ObjectId, 
    limit: number,
    type?: StoryTypeEnum
}

export interface IParseCursorQueryOpt {
    cursorId: ObjectId,
    type?: StoryTypeEnum,
    page: CursorPageEnum
}

export interface IGetByCursorOpt {
    filter: FilterQuery<StoryEntity>
    userId: ObjectId, 
    limit: number,
}