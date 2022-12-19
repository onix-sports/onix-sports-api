import { IActionEventData } from '../core/interfaces/action-event-data.interface';
import { GameInfo } from '../core/interfaces/game-info.interface';

export interface IFinish {
  id: string;
  info: GameInfo;
}

export interface ITranslateAction extends IActionEventData {}
