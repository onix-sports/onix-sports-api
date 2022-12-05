import { ApiProperty } from '@nestjs/swagger';
import { TournamentType } from '../enum/tour-type.enum';

export class CreateTournamentDto {
  @ApiProperty({ type: String, required: false })
    readonly title?: string;

  @ApiProperty({ required: false })
  readonly type?: TournamentType;
}
