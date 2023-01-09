import { WsExceptionFilter } from '@filters/ws-exception.filter';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter'
import { ObjectId } from 'mongodb';
import JwtWSAccessGuard from '@guards/jwt-ws-access.guard';
import { Client, SocketClient } from '@decorators/socket-client.decorator';
import { UserEntity } from '@components/users/schemas/user.schema';
import SocketUser from '@decorators/socket-user.decorator';

import { ReadStoryDto } from './dto/read-story.dto';
import { StoriesService } from './stories.service';
import { AddCommentDto } from './dto/add-comment.dto';
import { AddEmojiDto } from './dto/add-emoji.dto';
import { GetStoryInfoDto } from './dto/get-comment.dto';
import { GetLastStoriesDto } from './dto/get-last-stories.dto';
import { Story } from './schemas/story.schema';
import { GetStoriesDto } from './dto/get-stories.dto';
import { GetByCursorStoriesDto } from './dto/get-by-cursor-stories.dto';

@UseFilters(new WsExceptionFilter())
@UseGuards(JwtWSAccessGuard)
@WebSocketGateway({ transports: ['websocket'], namespace: 'stories' })
export class StoriesGateway implements OnGatewayInit {
  constructor(
    private readonly storiesService: StoriesService,
  ) {}

  @WebSocketServer()
  server: Server = new Server();

  private logger: Logger = new Logger(StoriesGateway.name);

  afterInit() {
  }

  @OnEvent('story.new')
  public newStory(story: Story) {
    this.server.emit('new-story', story);
  }

  @SubscribeMessage('read-stories')
  public async read(
    @SocketUser() user: UserEntity, 
    @MessageBody() { storiesIds }: ReadStoryDto
  ) {
    await this.storiesService.setReadStatus(storiesIds, user._id);

    this.server.emit('new-read', { user, storiesIds });
  }

  @SubscribeMessage('read-all-stories')
  public async readAll(
    @SocketUser() user: UserEntity, 
  ) {
    await this.storiesService.setReadStatusForAll(user._id);

    this.server.emit('new-read-all', { user });
  }

  @SubscribeMessage('add-emoji')
  public async addEmoji(
    @SocketUser() user: UserEntity,
    @MessageBody() { storyId, emoji }: AddEmojiDto
  ) {
    await this.storiesService.addEmoji(storyId, { user: user._id, emoji });

    this.server.emit('new-emoji', { user, emoji });
  }

  @SubscribeMessage('add-comment')
  public async addComment(
    @MessageBody() { storyId, comment }: AddCommentDto,
    @SocketUser() user: UserEntity
  ) {
    await this.storiesService.addComment(storyId, { user: user._id, comment });

    this.server.emit('new-emoji', { user, comment });
  }

  @SubscribeMessage('get-comments')
  public async getComments (
    @MessageBody() { storyId, limit, skip }: GetStoryInfoDto
  ) {
    return this.storiesService.getComments(storyId, { limit, skip });
  }

  @SubscribeMessage('get-emojis')
  public async getEmojis (
    @MessageBody() { storyId, limit, skip }: GetStoryInfoDto
  ) {
    return this.storiesService.getEmojis(storyId, { limit, skip });
  }

  @SubscribeMessage('get-read-users')
  public async getReadUsers (
    @MessageBody() { storyId, limit, skip }: GetStoryInfoDto
  ) {
    return this.storiesService.getReadUsers(storyId, { limit, skip });
  }

  @SubscribeMessage('get-unread-stories')
  public async getUnread (
    @SocketUser() { _id }: UserEntity,
    @MessageBody() { limit, type }: GetLastStoriesDto
  ) {
    return this.storiesService.getUnread({ userId: _id, limit, type });
  }

  @SubscribeMessage('get-stories')
  public async getStories (
    @SocketUser() { _id }: UserEntity,
    @MessageBody() { limit, skip, type }: GetStoriesDto
  ) {
    return this.storiesService.getPaginated({ userId: _id, limit, skip, type });
  }

  @SubscribeMessage('get-by-cursor')
  public async getByCursor (
    @SocketUser() { _id }: UserEntity,
    @MessageBody() { limit, type, page, storyId }: GetByCursorStoriesDto
  ) {
    return this.storiesService.getByCursor({ 
      userId: _id, 
      limit, 
      type, 
      page, 
      cursorId: storyId 
    });
  }
}
