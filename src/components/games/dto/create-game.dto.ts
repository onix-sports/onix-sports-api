import { toObjectId } from '@components/common/transforms/to-object-id.transform';
import { toObjectIds } from '@components/common/transforms/to-object-ids.transform';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export default class CreateGameDto {
    @ApiProperty({ type: String })
    readonly title?: string | null;

    @ApiProperty({ type: [String] })
    @Transform(toObjectIds)
    readonly players: ObjectId[];

    @ApiProperty({ type: String })
    @Transform(toObjectId)
    readonly tournament?: ObjectId;
}
