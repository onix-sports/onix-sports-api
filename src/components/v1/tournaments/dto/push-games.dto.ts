import { StringObjectId } from '@components/v1/common/types/string-objectid.type';
import { ApiProperty } from '@nestjs/swagger';

export class PushGamesDto {
  @ApiProperty({ type: String })
    readonly id: StringObjectId = '';

  @ApiProperty({ type: [String] })
  readonly games: StringObjectId[] = [];
}
