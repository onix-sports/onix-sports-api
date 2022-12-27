import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { StoryTypeEnum } from '../enums/story-type.enum';

export class GetLastStoriesDto {
  @IsNumber()
  @IsOptional()
  readonly limit: number = 10;

  @IsOptional()
  @IsEnum(StoryTypeEnum)
  readonly type?: StoryTypeEnum
}
