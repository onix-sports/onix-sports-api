import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum, IsNumber, IsOptional,
} from 'class-validator';
import { TournamentStatus } from '../enum/tour-status.enum';

export class GetTournamentsDto {
    @ApiPropertyOptional({ enum: TournamentStatus })
    @IsOptional()
    @IsEnum(TournamentStatus)
    status: TournamentStatus;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    @IsNumber()
    skip: number;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    @IsNumber()
    limit: number;
}
