import { ApiProperty } from '@nestjs/swagger';
import { Action } from '../core/action.class';
import { Player } from '../core/player.class';
import { Teams } from '../enum/teams.enum';

export class GameInfoDto {
  @ApiProperty()
      id: String;

  @ApiProperty()
      winner: Teams;

  @ApiProperty()
      title: String;

  @ApiProperty()
      finishedAt: Date;

  @ApiProperty()
      startedAt: Date;

  @ApiProperty({ type: Player, isArray: true })
      players: [];

  @ApiProperty()
      status: String;

  @ApiProperty()
      score: String;

  @ApiProperty()
      duration: Number;

  @ApiProperty({ type: Action, isArray: true })
      actions: [];
}
