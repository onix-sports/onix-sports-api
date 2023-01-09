import { IsNumber, IsOptional } from 'class-validator';
import { GetLastStoriesDto } from './get-last-stories.dto';

export class GetStoriesDto extends GetLastStoriesDto {
  @IsNumber()
  @IsOptional()
  readonly skip: number = 0;
}
