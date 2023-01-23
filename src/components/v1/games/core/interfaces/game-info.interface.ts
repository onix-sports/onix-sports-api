import { ObjectId } from 'mongodb';
import { Player } from '../player.class';
import { Action } from '../action.class';
import { GameStatus } from '../../enum/game-status.enum';
import { Teams } from '../../enum/teams.enum';

export interface GameInfo {
  id: any;
  title: string,
  players: Player[],
  actions?: Action[],
  score: any,
  status: GameStatus,
  winner: Teams,
  startedAt: Date,
  finishedAt: Date,
  duration: number,
  tournament: ObjectId;
}
