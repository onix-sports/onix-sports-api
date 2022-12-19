import { toObjectIds } from '@components/v1/common/transforms/to-object-ids.transform';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class GenerateTournamentDto {
    @ApiPropertyOptional({ type: String })
    @IsString()
    @IsOptional()
    readonly title?: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayMinSize(4)
    @Type(() => String)
    @Transform(toObjectIds)
    readonly players: ObjectId[];
}
