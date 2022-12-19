import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';

export class GetGamesDto {
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    skip?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => new ObjectId(value))
    tournament?: ObjectId;
}
