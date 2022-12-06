import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetGamesDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    skip?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    tournament?: string;
}
