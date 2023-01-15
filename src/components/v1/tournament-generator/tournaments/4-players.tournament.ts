import { TournamentType } from '@components/v1/tournaments/enum/tour-type.enum';
import { Tournament } from '../decorators/tournament.decorator';
import { ITournament } from '../interfaces/tournament.interface';

@Tournament(
    TournamentType.FOUR_PLAYERS,
    {
        players: 4,
        games: [
            [0, 1, 2, 3],
            [0, 2, 1, 3],
            [0, 3, 1, 2],
        ],
        teams: [],
    },
)
export class FourPlayersTournament implements ITournament {}
