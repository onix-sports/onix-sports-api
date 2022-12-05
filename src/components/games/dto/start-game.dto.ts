import { ApiProperty } from '@nestjs/swagger';

export class GameIdDto {
  @ApiProperty({ type: String })
    readonly id: String = '';
}
