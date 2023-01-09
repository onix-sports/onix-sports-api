import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PaginationDto } from '@components/common/dto/pagination.dto';
import userConstants from "@components/users/user-constants";

import { storiesConstants } from './stories-constants';
import { StoryEntity } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';

import { StoryTypeEnum } from './enums/story-type.enum';
import { IGetByCursorOpt, IGetPagByQuery } from './interfaces/get-last-stories.interface';
import { StoryComment } from './schemas/story-comments.schema';

const wait = async (ms: any) => new Promise(resolve => {
  setTimeout(resolve, ms)
})

@Injectable()
export class StoriesRepository {
  constructor(
    @InjectModel(storiesConstants.models.stories) 
    private readonly storyModel: Model<StoryEntity>,
    private readonly eventEmitter: EventEmitter2
  ) {
    
    // this.test()
  }

  // async test() {
  //   try {
  //     for (let index = 0; index < 100; index++) {
  //       await wait(200)
  //     // const element = array[index];
  //     this.storyModel.create({
  //       type: StoryTypeEnum.newTournament,
  //       content: {
  //         players: 5
  //       }
  //     });
      
  //   }
  //   } catch (error) {
  //     console.log('error :>> ', error);
  //   }
  // }

  async create(story: CreateStoryDto) {
    const _story = await this.storyModel.create(story);

    await this.eventEmitter.emitAsync('story.created', _story);

    return _story;
  }

  getById(id: ObjectId, projection?: string[]) {
    return this.storyModel.findById(id, projection);
  }

  get(filter: FilterQuery<StoryEntity>, pagination: PaginationDto, projection?: string[]) {
    return this.storyModel.find(filter, projection, pagination);
  }

  async getFirstUnread(userId: ObjectId) {
    return this.storyModel.findOne({ readBy: { $nin: userId } }, { _id: 1 }, { sort: { _id: 1 } });
  }

    updateMany(filter: FilterQuery<StoryEntity>, set: any, projection?: string[]) {
    return this.storyModel.updateMany(filter, set, projection);
  }

  updateOne(filter: FilterQuery<StoryEntity>, set: any, projection?: string[]) {
    return this.storyModel.updateOne(filter, set, projection);
  }

  getComments(_id: ObjectId, { skip, limit }: PaginationDto): Aggregate<StoryComment[]> {
    return this.storyModel.aggregate([
      { $match: { _id } },
      { $project: { comments: 1 } },
      { $unwind: "$comments" },
      { $replaceRoot: { newRoot: "$comments" } }, 
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);
  }

  getEmojis(_id: ObjectId, { skip, limit }: PaginationDto) {
    return this.storyModel.aggregate([
      { $match: { _id } },
      { $project: { emojis: 1 } },
      { $unwind: "$emojis" },
      { $replaceRoot: { newRoot: "$emojis" } }, 
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from:  userConstants.models.users,
          let: { id: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$id'] },
              },
            },
            {
              $project: {
                _id: 1,
                avatarUrl: 1,
                email: 1,
                name: 1
              },
            },
          ],
          as: 'users',
        },
      },
      { $project: { 
          emoji: 1,
          user: { $first: '$users' },
          createdAt: 1,
          updatedAt: 1
        } 
      },
    ]);
  }

  getReadUsers(_id: ObjectId, { skip, limit }: PaginationDto) {
    return this.storyModel.aggregate([
      { $match: { _id } },
      { $project: { readBy: 1 } },
      { $unwind: "$readBy" },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from:  userConstants.models.users,
          let: { id: '$readBy' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$id'] },
              },
            },
            {
              $project: {
                _id: 1,
                avatarUrl: 1,
                email: 1,
                name: 1
              },
            },
          ],
          as: 'users',
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayElemAt: ['$users', 0] }
        },
      },
    ]);
  }

  async getByCursor({ filter, userId, limit }: IGetByCursorOpt) {
    const res = await this.storyModel.aggregate([
      { $match: filter },
      { $facet: this.getFormatStoriesFacet(limit, userId) }
    ]);

    return this.trmAgregRes(res);
  }

  async getPaginated({ filter, userId, limit, skip }: IGetPagByQuery) {
    const res = await this.storyModel.aggregate([
      { $match: filter },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $facet: this.getFormatStoriesFacet(limit, userId) }
    ]);

    return this.trmAgregRes(res);
  }

  async getLast({ filter, userId, limit }: IGetByCursorOpt) {
    const res = await this.storyModel.aggregate([
      { $match: filter },
      { $sort: { _id: -1 } },
      { $facet: this.getFormatStoriesFacet(limit, userId) }
    ]);

    return this.trmAgregRes(res);
  }

  private getFormatStoriesFacet = (limit: number, userId?: ObjectId) => {
    return {
            stories: [
              { $limit: limit },
              { 
                  $project: {
                    type: 1,
                    content: 1,
                    read: userId ? { $in: [ userId, '$readBy' ] } : false,
                    comments: { $size: "$comments" },
                  } 
              },
            ],
            count: [
              { $count: 'total' }
            ],
            emojis: [
              { $limit: limit },
              { $unwind: "$emojis" },
              { 
                $group: {
                  _id: { storyId: '$_id', emoji: '$emojis.emoji' },
                  count: { $sum: 1 }
                } 
              },
              { $project: { count: 1, storyId: '$_id.storyId', emoji: '$_id.emoji' } },
            ]
        } 
  }

  private trmAgregRes([data]: any) {
    return {
      stories: data.stories,
      emojis: data.emojis,
      total: data.count[0].total
    }
  }
}
