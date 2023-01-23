import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';

export class GetLeaderboardDto {
    @ApiPropertyOptional({ type: Date })
    @IsOptional()
    @IsDate()
    dateFrom: Date;

    @ApiPropertyOptional({ type: Date })
    @IsOptional()
    @IsDate()
    dateTo: Date;
}
