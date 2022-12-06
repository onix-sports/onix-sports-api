import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsNumber } from 'class-validator';
import { TournamentStatus } from '../enum/tour-status.enum';

export class GetTournamentsDto {
    @ApiProperty({ enum: TournamentStatus })
    @IsDefined()
    @IsEnum(TournamentStatus)
    status: TournamentStatus;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    skip: number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    limit: number;
}
