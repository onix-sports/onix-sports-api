import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class PlayersDto {
  @ApiProperty({ type: [String] })
      red: ObjectId[] = [];

  @ApiProperty({ type: [String] })
      blue: ObjectId[] = [];
}

export type Players = {
  red: ObjectId[];
  blue: ObjectId[];
}
