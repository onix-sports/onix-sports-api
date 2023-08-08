import { ObjectId } from 'mongodb';
import { Player } from '../player.class';
import { Action } from '../action.class';
import { GameStatus } from '../../enum/game-status.enum';
import { Teams } from '../../enum/teams.enum';

export interface GameInfo {
  id: ObjectId;
  title: string;
  players: Player[];
  actions?: Action[];
  score: any;
  status: GameStatus;
  winner: Teams | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  duration: number;
  tournament: ObjectId | null;
  organization: ObjectId;
  moderator: ObjectId;
  posibleWinner: Teams | null;
}
