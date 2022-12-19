import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetUsersDto {
    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    @IsNumber()
    limit: number;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    @IsNumber()
    skip: number;
}
