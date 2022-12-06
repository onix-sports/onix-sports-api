import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TournamentType } from '../enum/tour-type.enum';

export class CreateTournamentDto {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    readonly title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(TournamentType)
    readonly type?: TournamentType;
}
