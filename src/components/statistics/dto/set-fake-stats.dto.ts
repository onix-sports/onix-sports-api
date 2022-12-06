import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean, IsDefined, IsNumber, IsString,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export default class FakeStatsDto {
    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    mGoals: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    rGoals: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    goals: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    amGoals: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    arGoals: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    aGoals: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    blueWon: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    redWon: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    won: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    blueGames: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    redGames: Number;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsNumber()
    games: Number;

    @ApiProperty({ type: String })
    @IsDefined()
    @Transform(({ value }) => new ObjectId(value))
    user: any;

    @ApiProperty({ type: String })
    @IsDefined()
    @IsString()
    name: String;

    @ApiProperty({ type: Boolean })
    @IsDefined()
    @IsBoolean()
    enabled: Boolean;
}
