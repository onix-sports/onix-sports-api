import { PaginationDto } from '@components/common/dto/pagination.dto';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { CreateStoryDto } from './dto/create-story.dto';
import { CursorPageEnum, CursorPageQuery } from './enums/cursor-pagination-page.enum';
import { ILastStoriesOpt, IParseCursorQueryOpt } from './interfaces/get-last-stories.interface';
import { StoryComment } from './schemas/story-comments.schema';
import { StoryEmoji } from './schemas/story-emojis.schema';
import { StoriesRepository } from './stories.repository';

const userId = new ObjectId('638efd8d22b4507fd5a3856e');
const storyId = new ObjectId('63a9a26ee9a535c408c1c11d');
const story2Id = new ObjectId('63a9a26ee9a535c408c1c11b');
@Injectable()
export class StoriesService {
  constructor(
    private readonly storiesRepository: StoriesRepository,
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
// await this.getUnread(userId, 20);
    } catch (error) {
      console.log('error :>> ', error);
    }
  }

  public create(story: CreateStoryDto) {
      return this.storiesRepository.create(story);
  }

  public setReadStatus(_ids: ObjectId[], userId: ObjectId) {
    return this.storiesRepository.updateMany({ _id: { $in: _ids } }, { $addToSet: { readBy: userId } });
  }

  public addEmoji(_id: ObjectId, emoji: StoryEmoji) {
    return this.storiesRepository.updateOne({ _id }, { $addToSet: { emojis: emoji } });
  }

  public addComment(_id: ObjectId, comment: StoryComment) {
    return this.storiesRepository.updateOne({ _id }, { $addToSet: { comments: comment } });
  }

  public getComments(_id: ObjectId, pagination: PaginationDto) {
    return this.storiesRepository.getComments(_id, pagination);
  }

  public getEmojis(_id: ObjectId, pagination: PaginationDto) {
    return this.storiesRepository.getEmojis(_id, pagination);
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
      limit 
    });

    return { 
      stories: [ ...unreadStoriesRes.stories, ...stories ],
      emojis: [ ...unreadStoriesRes.emojis, ...emojis ],
    }
      
  }
  

  private parseCursorQuery({ cursorId, page, type }: IParseCursorQueryOpt) {
    const query = { _id: { [CursorPageQuery[page]]: cursorId  } };

    if (type) {
      Reflect.set(query, 'type', type)
    }

    return query;
  }
}
