import { ApiProperty } from '@nestjs/swagger';
import { GameIdDto } from './start-game.dto';

export class GameEventDto extends GameIdDto {
  @ApiProperty({ type: String })
    readonly playerId: string = '';

  @ApiProperty({ type: String })
  readonly enemyId: string = '';

  @ApiProperty({ type: Number })
  readonly actionId: number;
}
