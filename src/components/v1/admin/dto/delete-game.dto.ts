import { toObjectId } from '@components/v1/common/transforms/to-object-id.transform';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { ObjectId } from 'mongodb';

export class DeleteGameDto {
    @ApiProperty({ type: String })
    @Type(() => String)
    @IsDefined()
    @Transform(toObjectId)
    id: ObjectId;
}
