import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';

export interface ITournament {
    onGameFinished?(info: GameInfo, playersIndexes: { [key: string]: number }): Promise<Array<any>>;
}
