import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetUsersDto {
    @ApiProperty({ type: Number })
    @IsOptional()
    @IsNumber()
    limit: number;

    @ApiProperty({ type: Number })
    @IsOptional()
    @IsNumber()
    skip: number;
}
