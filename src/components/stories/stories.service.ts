import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PaginationDto } from '@components/common/dto/pagination.dto';
import { UsersService } from '@components/users/users.service';

import { CreateStoryDto } from './dto/create-story.dto';
import { CursorPageEnum, CursorPageQuery } from './enums/cursor-pagination-page.enum';
import { IGetByCursorQueryOpt, ILastStoriesOpt, IPagStoriesOpt, IParseCursorQueryOpt } from './interfaces/get-last-stories.interface';
import { StoryComment } from './schemas/story-comments.schema';
import { StoryEmoji } from './schemas/story-emojis.schema';
import { StoriesRepository } from './stories.repository';
import { StoryTypeEnum } from './enums/story-type.enum';
import { isEnum } from 'class-validator';

const userId = new ObjectId('638efd8d22b4507fd5a3856e');
const storyWithRead = new ObjectId('63a9a26ee9a535c408c1c119');
const storyId = new ObjectId('63a9a26ee9a535c408c1c11d');
const story2Id = new ObjectId('63a9a26ee9a535c408c1c11b');
@Injectable()
export class StoriesService {
  constructor(
    private readonly storiesRepository: StoriesRepository,
    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.test()
  }

  async test() {
    try {
//     await this.addComment(storyId, { user: userId, comment: '2' });
// await this.addComment(storyId, { user: userId, comment: 'ssergrefgerwg' });
// await this.addComment(storyId, { user: userId, comment: 'ss2323' });
// await this.addComment(storyId, { user: userId, comment: '1' });
//  await this.addEmoji(storyId, { user: userId, emoji: '2' });
// await this.addEmoji(storyId, { user: userId, emoji: 'ssergrefgerwg' });
// await this.addEmoji(storyId, { user: userId, emoji: 'ss2323' });
// await this.addEmoji(storyId, { user: userId, emoji: '1' });
// await this.setReadStatus([storyId, story2Id], userId)
// const res = await this.getUnread({ userId, limit: 20 });
// console.log('res :>> ', res);
// await this.getReadUsers(storyWithRead, { limit: 100, skip: 0 })
// await this.getEmojis(storyWithRead, { limit: 100, skip: 0 })
// await this.getComments(storyWithRead, { limit: 100, skip: 0 })

    } catch (error) {
      console.log('error :>> ', error);
    }
  }

  public async create(story: CreateStoryDto) {
      const storyDoc = await this.storiesRepository.create(story);

      await this.eventEmitter.emitAsync('story.new', storyDoc);
  }

  public setReadStatus(_ids: ObjectId[], userId: ObjectId) {
    return this.storiesRepository.updateMany({ _id: { $in: _ids } }, { $addToSet: { readBy: userId } });
  }

  public setReadStatusForAll(userId: ObjectId) {
    return this.storiesRepository.updateMany({ readBy: { $ne: userId } }, { $addToSet: { readBy: userId } });
  }

  public addEmoji(_id: ObjectId, emoji: StoryEmoji) {
    return this.storiesRepository.updateOne({ _id }, { $addToSet: { emojis: emoji } });
  }

  public addComment(_id: ObjectId, comment: StoryComment) {
    return this.storiesRepository.updateOne({ _id }, { $addToSet: { comments: comment } });
  }

  public async getComments(_id: ObjectId, pagination: PaginationDto) {
    const comments = await this.storiesRepository.getComments(_id, pagination);

    const users = await this.userService.getUsers(comments.reduce((acc: ObjectId[], comment) => {
      if (!acc.some(userId => userId.equals(comment.user))) {
        acc.push(comment.user);
      }

      return acc;
    }, []));

    return {
      data: comments,
      included: {
        users
      }
    }
  }

  public getEmojis(_id: ObjectId, pagination: PaginationDto) {
    return this.storiesRepository.getEmojis(_id, pagination);
  }

  public getReadUsers(_id: ObjectId, pagination: PaginationDto) {
    return this.storiesRepository.getReadUsers(_id, pagination);
  }

  public getPaginated({ userId, limit, skip, type }: IPagStoriesOpt) {
    return this.storiesRepository.getPaginated({
      filter: type ? { type } : {},
      userId,
      limit,
      skip
    })
  }

  public getByCursor({ userId, page, limit, type, cursorId }: IGetByCursorQueryOpt) {
    return this.storiesRepository.getByCursor({ 
      filter: this.parseCursorQuery({ 
          cursorId, 
          type, 
          page
        }), 
      userId, 
      limit 
    });
  }

  public async getUnread({ userId, limit, type }: ILastStoriesOpt) {
    const unread = await this.storiesRepository.getFirstUnread(userId);

    if (!unread) {
      return this.storiesRepository.getLast({ 
        filter: type ? { type } : {},
        userId,
        limit 
      });
    }

    const unreadStoriesRes = await this.storiesRepository.getByCursor({ 
      filter: this.parseCursorQuery({ 
          cursorId: unread._id, 
          type, 
          page: CursorPageEnum.unread 
        }), 
      userId, 
      limit 
    });

    if (unreadStoriesRes.stories.length === limit) return unreadStoriesRes;
  
    const { stories, emojis } = await this.storiesRepository.getByCursor({ 
      filter: this.parseCursorQuery({ 
          cursorId: unread._id, 
          type, 
          page: CursorPageEnum.prev
        }), 
      userId, 
      limit: limit - unreadStoriesRes.stories.length
    });

    return { 
      stories: [ ...unreadStoriesRes.stories, ...stories ],
      emojis: [ ...unreadStoriesRes.emojis, ...emojis ],
    }
      
  }

  private setQueryType(query: any = {}, type?: StoryTypeEnum) {
    return type && isEnum(type, StoryTypeEnum) ? { ...query, type } : { ...query }
  }
  

  private parseCursorQuery({ cursorId, page, type }: IParseCursorQueryOpt) {
    return this.setQueryType({ _id: { [CursorPageQuery[page]]: cursorId  } }, type)
  }
}
