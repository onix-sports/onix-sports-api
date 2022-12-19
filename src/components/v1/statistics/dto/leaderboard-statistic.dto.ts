import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardStatistic {
    @ApiProperty()
    gpg: number;

    @ApiProperty()
    winrate: number;

    @ApiProperty()
    games: number;

    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    isGuest: boolean;

    @ApiProperty()
    wScore: number;

    @ApiProperty()
    gScore: number;

    @ApiProperty()
    score: number;
}
