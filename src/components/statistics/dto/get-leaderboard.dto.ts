import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsDefined } from 'class-validator';

export class GetLeaderboardDto {
    @ApiProperty({ type: Number })
    @IsDefined()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    dateFrom: Date;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    dateTo: Date;
}
