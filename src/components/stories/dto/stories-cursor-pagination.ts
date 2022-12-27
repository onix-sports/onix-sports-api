import { IsNumber, IsOptional } from 'class-validator';

import { GetStoryDto } from './get-story.dto';

export class StoriesCursorPaginationDto {
  @IsNumber()
  @IsOptional()
  readonly limit: number = 10;
}
