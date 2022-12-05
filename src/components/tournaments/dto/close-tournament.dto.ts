import { StringObjectId } from '@components/common/types/string-objectid.type';
import { ApiProperty } from '@nestjs/swagger';

export class CloseTournamentDto {
  @ApiProperty({ type: String })
    readonly id: StringObjectId = '';
}
