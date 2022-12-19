import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntity {
    @ApiProperty({ description: 'scores by goals' })
    gScore: number;

    @ApiProperty({ description: 'total score' })
    score: number;

    @ApiProperty({ description: 'scores by winrate' })
    wScore: number;

    @ApiProperty({ description: 'goals per game' })
    gpg: number;

    @ApiProperty()
    winrate: number;

    @ApiProperty({ description: 'Number of games played' })
    games: number;

    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ description: 'If there is not enought games count this field is true and score is 0' })
    isGuest: boolean;
}
