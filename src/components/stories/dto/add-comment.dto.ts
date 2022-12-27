import { IsNotEmpty, IsString } from 'class-validator';

import { GetStoryDto } from './get-story.dto';

export class AddCommentDto extends GetStoryDto {
  @IsString()
  @IsNotEmpty()
  readonly comment: string = '';
}
