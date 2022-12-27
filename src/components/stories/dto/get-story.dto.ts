import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId } from "mongodb";

export class GetStoryDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly storyId: ObjectId = new ObjectId();
}
