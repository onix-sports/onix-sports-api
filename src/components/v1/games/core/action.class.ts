import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { ActionType } from '../enum/action-type.enum';
import { Player } from './player.class';

interface IAction {
    type: ActionType;
    player?: Player;
    info: any;
    game: ObjectId;
    startedAt: Date;
    id: ObjectId;
    time?: Date;
    timeFromStart?: number;
}

export class Action {
    @ApiProperty({ type: String })
    type: ActionType;

    @ApiProperty({ type: String })
    player: Player | null | undefined;

    @ApiProperty({ type: String })
    time: Date;

    @ApiProperty({ type: String })
    timeFromStart: number;

    @ApiProperty({ type: String })
    info: any;

    @ApiProperty({ type: String })
    game: ObjectId;

    @ApiProperty({ type: Number })
    id: ObjectId;

    constructor({
        type,
        player,
        info,
        game,
        startedAt,
        id,
        time = new Date(),
        timeFromStart = new Date().valueOf() - startedAt.valueOf(),
    }: IAction) {
        this.type = type;
        this.player = player && new Player(player);
        this.time = new Date(time);
        this.timeFromStart = timeFromStart;
        this.info = info;
        this.game = new ObjectId(game);
        this.id = new ObjectId(id);
    }
}
