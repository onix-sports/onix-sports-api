import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class GenerateTournamentDto {
  @ApiProperty({ type: String, required: false })
    readonly title?: string;

  @ApiProperty({ type: [String], required: true })
  readonly players: ObjectId[];
}
