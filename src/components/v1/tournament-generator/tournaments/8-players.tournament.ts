import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';
import { StatisticsService } from '@components/v1/statistics/services/statistics.service';
import { TournamentType } from '@components/v1/tournaments/enum/tour-type.enum';
import { Tournament } from '../decorators/tournament.decorator';
import { ITournament } from '../interfaces/tournament.interface';

@Tournament(
    TournamentType.EIGHT_PLAYERS,
    {
        players: 8,
        games: [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
        ],
        teams: [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
        ],
    },
)
export class EightPlayersTournament implements ITournament {
    constructor(
        private readonly statisticsService: StatisticsService,
    ) {}

    private getTeammateIndex(index: number) {
        return index % 2 === 0 ? index + 1 : index - 1;
    }

    async onGameFinished(info: GameInfo, playersIndexes: { [key: string]: number }, stats: any[]) {
        if (!stats.every((stat) => stat.games === 1) || stats.length !== 8) {
            return [];
        }

        const winners = stats.sort((a, b) => a.won - b.won).splice(4);

        return [stats, winners].map((players) => {
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
