import { TournamentType } from '@components/v1/tournaments/enum/tour-type.enum';
import { Tournament } from '../decorators/tournament.decorator';
import { ITournament } from '../interfaces/tournament.interface';

@Tournament(
    TournamentType.FIVE_PLAYERS,
    {
        players: 5,
        games: [
            [0, 1, 2, 3],
            [0, 4, 1, 3],
            [3, 4, 0, 2],
            [1, 2, 0, 3],
            [3, 2, 4, 1],
        ],
        teams: [],
    },
)
export class FivePlayersTournament implements ITournament {}
