import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { CursorPageEnum } from '../enums/cursor-pagination-page.enum';
import { StoryTypeEnum } from '../enums/story-type.enum';
import { GetStoryDto } from './get-story.dto';

export class GetByCursorStoriesDto extends GetStoryDto {
  @IsNumber()
  @IsOptional()
  readonly limit: number = 10;

  @IsOptional()
  @IsEnum(StoryTypeEnum)
  readonly type?: StoryTypeEnum

  @IsNotEmpty()
  @IsEnum(CursorPageEnum)
  readonly page: CursorPageEnum = CursorPageEnum.next
}
