import { UserEntity } from '@components/users/schemas/user.schema';
import { ObjectId } from 'mongoose';
import { TournamentType } from '../enum/tour-type.enum';

export const fivePlayersTournament = (players: UserEntity[], tournament: ObjectId) => ({
    type: TournamentType.FIVE_PLAYERS,
    games: [
        {
            players: [players[0], players[1], players[2], players[4]],
            tournament,
        },
        {
            players: [players[0], players[4], players[1], players[3]],
            tournament,
        },
        {
            players: [players[3], players[4], players[0], players[2]],
            tournament,
        },
        {
            players: [players[1], players[2], players[0], players[3]],
            tournament,
        },
        {
            players: [players[3], players[2], players[4], players[1]],
            tournament,
        }],
    teams: [],
});
