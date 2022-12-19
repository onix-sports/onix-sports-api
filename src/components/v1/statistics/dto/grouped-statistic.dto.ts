import { ApiProperty } from '@nestjs/swagger';

export class GroupedStatistic {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    goals: number;

    @ApiProperty()
    mGoals: number;

    @ApiProperty()
    rGoals: number;

    @ApiProperty()
    aGoals: number;

    @ApiProperty()
    amGoals: number;

    @ApiProperty()
    arGoals: number;

    @ApiProperty()
    blueWon: number;

    @ApiProperty()
    redWon: number;

    @ApiProperty()
    blueGames: number;

    @ApiProperty()
    redGames: number;

    @ApiProperty()
    won: number;

    @ApiProperty()
    games: number;

    @ApiProperty()
    name: string;
}
