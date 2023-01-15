import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';
import { TournamentType } from '@components/v1/tournaments/enum/tour-type.enum';
import { Tournament } from '../decorators/tournament.decorator';
import { ITournament } from '../interfaces/tournament.interface';

@Tournament(
    TournamentType.TEN_PLAYERS,
    {
        players: 10,
        games: [
            [0, 1, 2, 3],
            [2, 3, 4, 5],
            [4, 5, 6, 7],
            [6, 7, 8, 9],
            [8, 9, 0, 1],
        ],
        teams: [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [8, 9],
        ],
    },
)
export class TenPlayersTournament implements ITournament {
    constructor() {}

    private getTeammateIndex(index: number) {
        return index % 2 === 0 ? index + 1 : index - 1;
    }

    async onGameFinished(info: GameInfo, playersIndexes: { [key: string]: number }, stats: any[]) {
        const condition = [
            // If not all players played 2 games
            !stats.every((stat) => stat.games === 2) || stats.length !== 10,

            // Only one team with 2 wins becomes a winner
            stats.filter((stat) => stat.won === 2).length === 2,

            // Draw
            stats.every((stat) => stat.won === 1),
        ].some(Boolean);

        if (condition) {
            return [];
        }

        // If there are 2 teams with 2 wins
        const winners = stats.filter((stat) => stat.won === 2);

        return [winners].map((players) => {
            return players.reduce((acc, player) => {
                const index = playersIndexes[player._id.toString()];
                const teammate = this.getTeammateIndex(playersIndexes[player._id.toString()]);

                if (acc.includes(index)) {
                    return acc;
                }

                return [...acc, index, teammate];
            }, []);
        });
    }
}
