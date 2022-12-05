import { UserEntity } from '@components/users/schemas/user.schema';
import { ObjectId } from 'mongoose';
import { TournamentType } from '../enum/tour-type.enum';

export const fourPlayersTournament = (players: UserEntity[], tournament: ObjectId) => ({
    type: TournamentType.FOUR_PLAYERS,
    games: [
        {
            players: [players[0], players[1], players[2], players[3]],
            tournament,
        },
        {
            players: [players[0], players[2], players[1], players[3]],
            tournament,
        },
        {
            players: [players[0], players[3], players[1], players[2]],
            tournament,
        }],
    teams: [],
});
