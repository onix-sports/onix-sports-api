import { toObjectId } from '@components/v1/common/transforms/to-object-id.transform';
import { toObjectIds } from '@components/v1/common/transforms/to-object-ids.transform';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
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
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @IsDefined()
    @Type(() => String)
    @Transform(toObjectIds)
    readonly players: ObjectId[];

    @ApiProperty({ type: String })
    @IsOptional()
    @Type(() => String)
    @Transform(toObjectId)
    readonly tournament?: ObjectId;

    readonly organization?: ObjectId;
}
