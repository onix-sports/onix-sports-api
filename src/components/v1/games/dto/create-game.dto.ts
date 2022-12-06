import { toObjectId } from '@components/v1/common/transforms/to-object-id.transform';
import { toObjectIds } from '@components/v1/common/transforms/to-object-ids.transform';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsArray, IsDefined, IsOptional, IsString,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export default class CreateGameDto {
    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    readonly title?: string | null;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsDefined()
    @Transform(toObjectIds)
    readonly players: ObjectId[];

    @ApiProperty({ type: String })
    @IsOptional()
    @Transform(toObjectId)
    readonly tournament?: ObjectId;
}
