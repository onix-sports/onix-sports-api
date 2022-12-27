import { RolesEnum } from "@decorators/roles.decorator";
import { ApiProperty } from "@nestjs/swagger";

import { StoryTypeEnum } from "../enums/story-type.enum";

export class CreateStoryDto {
    @ApiProperty({ enum: RolesEnum })
    type: StoryTypeEnum = StoryTypeEnum.memes;

    content: any
}
