import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';

export interface ITournament {
    onGameFinished?(info: GameInfo, playersIndexes: { [key: string]: number }, stats?: any[]): Promise<Array<any>>;
}
