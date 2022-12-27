import { IsNotEmpty, IsString } from 'class-validator';
import { GetStoryDto } from './get-story.dto';

export class AddEmojiDto extends GetStoryDto {
  @IsString()
  @IsNotEmpty()
  readonly emoji: string = '';
}
