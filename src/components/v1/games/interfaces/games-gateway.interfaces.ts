import { ObjectId } from 'mongodb';
import { IActionEventData } from '../core/interfaces/action-event-data.interface';
import { GameInfo } from '../core/interfaces/game-info.interface';

export interface IFinish {
  gameId: ObjectId;
  info: GameInfo;
}

export interface ITranslateAction extends IActionEventData {}
