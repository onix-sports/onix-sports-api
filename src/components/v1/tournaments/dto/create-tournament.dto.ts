import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum, IsOptional, IsString,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { TournamentType } from '../enum/tour-type.enum';

export class CreateTournamentDto {
    @ApiPropertyOptional({ type: String, required: false })
    @IsOptional()
    @IsString()
    readonly title?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsEnum(TournamentType)
    readonly type?: TournamentType;

    readonly organization: ObjectId;
}
