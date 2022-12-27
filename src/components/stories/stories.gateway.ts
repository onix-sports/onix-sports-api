import { WsExceptionFilter } from '@filters/ws-exception.filter';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { EventEmitter2 } from 'eventemitter2';
import { Server } from 'socket.io';
import { EventEmitter } from 'stream';
import { ObjectId } from 'mongodb';
import JwtWSAccessGuard from '@guards/jwt-ws-access.guard';
import { Client, SocketClient } from '@decorators/socket-client.decorator';
import { UserEntity } from '@components/users/schemas/user.schema';
import SocketUser from '@decorators/socket-user.decorator';

import { ReadStoryDto } from './dto/read-story.dto';
import { StoriesService } from './stories.service';
import { AddCommentDto } from './dto/add-comment.dto';
import { AddEmojiDto } from './dto/add-emoji.dto';
import { GetCommentDto } from './dto/get-comment.dto';
import { GetLastStoriesDto } from './dto/get-last-stories.dto';


@UseFilters(new WsExceptionFilter())
@UseGuards(JwtWSAccessGuard)
@WebSocketGateway({ transports: ['websocket'], namespace: 'stories' })
export class StoriesGateway implements OnGatewayInit {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly storiesService: StoriesService,
  ) {}

  @WebSocketServer()
  server: Server = new Server();

  private logger: Logger = new Logger(StoriesGateway.name);
  public emitter: EventEmitter = new EventEmitter();

  afterInit() {
    // this.emiter = this.gameProcessService.Emiter;

    // this.emiter.on('finish', this.finish);
  }

  private newStory(data: any) {
    // this.server.emit('new', { id, info });
  }



  @SubscribeMessage('read-stories')
  public async read(
    @SocketUser() { _id }: UserEntity, 
    @MessageBody() { storiesIds }: ReadStoryDto
  ): Promise<void> {
    await this.storiesService.setReadStatus(storiesIds, _id);
  }

  @SubscribeMessage('add-emoji')
  public async addEmoji(
    @SocketUser() { _id }: UserEntity,
    @MessageBody() { storyId, emoji }: AddEmojiDto
  ): Promise<void> {
    await this.storiesService.addEmoji(storyId, { user: _id, emoji });

    this.server.emit('new-emoji', { user: _id, emoji });
  }

  @SubscribeMessage('add-comment')
  public async addComment(
    @MessageBody() { storyId, comment }: AddCommentDto,
    @SocketUser() { _id }: UserEntity
  ): Promise<void> {
    await this.storiesService.addComment(storyId, { user: _id, comment });

    this.server.emit('new-emoji', { user: _id, comment });
  }

  @SubscribeMessage('get-comments')
  public async getComments (
    @MessageBody() { storyId, limit, skip }: GetCommentDto
  ): Promise<void> {
    await this.storiesService.getComments(storyId, { limit, skip });
  }

  @SubscribeMessage('get-emojis')
  public async getEmojis (
    @MessageBody() { storyId, limit, skip }: GetCommentDto
  ): Promise<void> {
    await this.storiesService.getEmojis(storyId, { limit, skip });
  }

  @SubscribeMessage('get-unread-stories')
  public async getUnread (
    @SocketUser() { _id }: UserEntity,
    @MessageBody() { limit, type }: GetLastStoriesDto
  ): Promise<void> {
    return this.storiesService.getUnread({ userId: _id, limit, type });
  }


}
