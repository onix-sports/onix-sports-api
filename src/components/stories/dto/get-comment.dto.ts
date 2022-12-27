import { IsNumber, IsOptional } from 'class-validator';

import { GetStoryDto } from './get-story.dto';

export class GetCommentDto extends GetStoryDto {
  @IsNumber()
  @IsOptional()
  readonly skip: number = 0;

  @IsNumber()
  @IsOptional()
  readonly limit: number = 10;
}
