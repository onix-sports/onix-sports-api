import { StringObjectId } from '@components/common/types/string-objectid.type';
import { ApiProperty } from '@nestjs/swagger';

export class PushGamesDto {
  @ApiProperty({ type: String })
    readonly id: StringObjectId = '';

  @ApiProperty({ type: [String] })
  readonly games: StringObjectId[] = [];
}
