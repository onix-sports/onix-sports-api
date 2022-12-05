import { UserEntity } from '@components/users/schemas/user.schema';
import { ObjectId } from 'mongoose';
import { TournamentType } from '../enum/tour-type.enum';

export const sixPlayersTournament = (players: UserEntity[], tournament: ObjectId) => ({
    type: TournamentType.SIX_PLAYERS,
    games: [
        {
            players: [players[0], players[1], players[2], players[3]],
            tournament,
        },
        {
            players: [players[2], players[3], players[4], players[5]],
            tournament,
        },
        {
            players: [players[4], players[5], players[0], players[1]],
            tournament,
        },
        {
            players: [players[0], players[1], players[2], players[3]],
            tournament,
        },
        {
            players: [players[2], players[3], players[4], players[5]],
            tournament,
        },
        {
            players: [players[4], players[5], players[0], players[1]],
            tournament,
        }],
    teams: [
        [players[0], players[1]],
        [players[2], players[3]],
        [players[4], players[5]],
    ],
});
