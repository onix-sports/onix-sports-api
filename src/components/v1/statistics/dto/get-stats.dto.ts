import { toObjectIds } from '@components/v1/common/transforms/to-object-ids.transform';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray, IsDate, IsOptional,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class GetStatsDto {
    @ApiPropertyOptional({ isArray: true, type: String, description: 'If not passed or array is empty - all users will be included' })
    @IsOptional()
    @IsArray()
    @Type(() => String)
    @Transform(toObjectIds)
    ids: ObjectId[];

    @ApiPropertyOptional({ type: Date })
    @IsOptional()
    @IsDate()
    dateFrom: Date;

    @ApiPropertyOptional({ type: Date })
    @IsOptional()
    @IsDate()
    dateTo: Date;
}
