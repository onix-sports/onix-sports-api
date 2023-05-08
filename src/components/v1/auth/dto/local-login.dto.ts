import { toObjectId } from '@components/v1/common/transforms/to-object-id.transform';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class LocalLoginDto {
    @ApiProperty({ type: String })
    @Type(() => String)
    @Transform(toObjectId)
    user: ObjectId;
}
