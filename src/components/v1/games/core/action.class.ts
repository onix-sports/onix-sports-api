import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { ActionType } from '../enum/action-type.enum';
import { Player } from './player.class';

export class Action {
  @ApiProperty({ type: String })
      type: ActionType;

  @ApiProperty({ type: String })
      player: Player | null | undefined;

  @ApiProperty({ type: String })
      time: any;

  @ApiProperty({ type: String })
      timeFromStart: number;

  @ApiProperty({ type: String })
      info: any;

  @ApiProperty({ type: String })
      game: ObjectId;

  @ApiProperty({ type: Number })
      id: number;

  constructor({
      type, player, info, game, startedAt, id,
  }: { type: ActionType, player?: Player, info: any, game: ObjectId, startedAt: Date, id: number }) {
      this.type = type;
      this.player = player;
      this.time = new Date();
      this.timeFromStart = new Date().valueOf() - startedAt.valueOf();
      this.info = info;
      this.game = game;
      this.id = id;
  }
}
