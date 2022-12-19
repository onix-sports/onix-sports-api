import { ActionType } from '@components/v1/games/enum/action-type.enum';
import { Action } from '../action.class';
import { Player } from '../player.class';
import { GameInfo } from './game-info.interface';

export interface IActionEventData {
  type: ActionType;
  player?: Player;
  info: GameInfo;
  actions: Action[];
}
