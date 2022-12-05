import { ActionType } from '@components/games/enum/action-type.enum';
import { Player } from '../player.class';

export interface IPushAction {
  type: ActionType;
  player?: Player;
}
