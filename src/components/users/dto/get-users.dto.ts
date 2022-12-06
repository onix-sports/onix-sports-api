import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber } from 'class-validator';

export class GetUsersDto {
    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    limit: number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    skip: number;
}
