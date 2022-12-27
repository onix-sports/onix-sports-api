import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PaginationDto } from '@components/common/dto/pagination.dto';

import { storiesConstants } from './stories-constants';
import { StoryEntity } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';

import { StoryTypeEnum } from './enums/story-type.enum';
import { IGetByCursorOpt } from './interfaces/get-last-stories.interface';

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

  get(filter: FilterQuery<StoryEntity>, projection?: string[]) {
    return this.storyModel.find(filter, projection);
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

  getComments(_id: ObjectId, { skip, limit }: PaginationDto) {
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
      { $limit: limit }
    ]);
  }

  async getByCursor({ filter, userId, limit }: IGetByCursorOpt) {
    const [res] = await this.storyModel.aggregate([
      { $match: filter },
      { $limit: limit },
      { $facet: this.getFormatStoriesFacet(userId) }
    ]);

    return res;
  }

  async getLast({ filter, userId, limit }: IGetByCursorOpt) {
    const [res] = await this.storyModel.aggregate([
      { $match: filter },
      { $sort: { _id: -1 } },
      { $limit: limit },
      { $facet: this.getFormatStoriesFacet(userId) }
    ]);

    return res;
  }

  private getFormatStoriesFacet = (userId: ObjectId) => {
    return {
            stories: [
              { 
                  $project: {
                    type: 1,
                    content: 1,
                    read: { $in: [ userId, '$readBy' ] },
                    comments: { $size: "$comments" },
                  } 
              },
            ],
            emojis: [
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
}
