import { IsArray, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class ReadStoryDto {
  @IsArray()
  readonly storiesIds: ObjectId[] = [new ObjectId()];
}
