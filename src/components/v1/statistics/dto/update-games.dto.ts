import { ObjectId } from 'mongodb';

export class UpdateGamesDto {
    longestGame: ObjectId;

    shortestGame: ObjectId;

    lastGames: ObjectId[];
}
