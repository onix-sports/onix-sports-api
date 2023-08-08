import { toObjectId } from '@components/v1/common/transforms/to-object-id.transform';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { ObjectId } from 'mongodb';

export class GetSeassonsDto {
    @ApiProperty({ type: String })
    @IsDefined()
    @Type(() => String)
    @Transform(toObjectId)
    organization: ObjectId;
}
