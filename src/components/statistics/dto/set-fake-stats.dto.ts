import { ApiProperty } from '@nestjs/swagger';

export default class FakeStatsDto {
    @ApiProperty({ type: Number })
    mGoals: Number;

    @ApiProperty({ type: Number })
    rGoals: Number;

    @ApiProperty({ type: Number })
    goals: Number;

    @ApiProperty({ type: Number })
    amGoals: Number;

    @ApiProperty({ type: Number })
    arGoals: Number;

    @ApiProperty({ type: Number })
    aGoals: Number;

    @ApiProperty({ type: Number })
    blueWon: Number;

    @ApiProperty({ type: Number })
    redWon: Number;

    @ApiProperty({ type: Number })
    won: Number;

    @ApiProperty({ type: Number })
    blueGames: Number;

    @ApiProperty({ type: Number })
    redGames: Number;

    @ApiProperty({ type: Number })
    games: Number;

    @ApiProperty({ type: String })
    user: any;

    @ApiProperty({ type: String })
    name: String;

    @ApiProperty({ type: Boolean })
    enabled: Boolean;
}
