import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';
import { TournamentType } from '@components/v1/tournaments/enum/tour-type.enum';
import { Tournament } from '../decorators/tournament.decorator';
import { ITournament } from '../interfaces/tournament.interface';

const games = [
    [0, 1, 2, 3],
    [2, 3, 4, 5],
    [4, 5, 0, 1],
];

@Tournament(
    TournamentType.SIX_PLAYERS,
    {
        players: 6,
        games,
        teams: [
            [0, 1],
            [2, 3],
            [4, 5],
        ],
    },
)
export class SixPlayersTournament implements ITournament {
    constructor() {}

    async onGameFinished(info: GameInfo, playersIndexes: { [key: string]: number }, stats: any[]) {
        const isDraw = stats.every((stat) => stat.won === 1);

        if (stats.every((stat) => stat.games === 2) && isDraw) {
            return games;
        }

        return [];
    }
}
