import { toObjectId } from '@components/v1/common/transforms/to-object-id.transform';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { ObjectId } from 'mongodb';

export class ModeratorDto {
    @ApiProperty({ type: String })
    @IsDefined()
    @Type(() => String)
    @Transform(toObjectId)
    tournament: ObjectId;

    @ApiProperty({ type: String })
    @IsDefined()
    @Type(() => String)
    @Transform(toObjectId)
    moderator: ObjectId;
}
