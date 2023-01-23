import { ActionType } from '@components/v1/games/enum/action-type.enum';
import { Player } from '../player.class';

export interface IPushAction {
  type: ActionType;
  player?: Player;
}
