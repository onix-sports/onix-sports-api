import EventEmitter from 'events';
import { ObjectId } from 'mongodb';
import { UserEntity } from '@components/v1/users/schemas/user.schema';
import { ActionType } from '../enum/action-type.enum';
import { GameStatus } from '../enum/game-status.enum';
import { Positions } from '../enum/positions.enum';
import { Teams } from '../enum/teams.enum';
import { gameEvent } from '../utils/event.util';
import { Action } from './action.class';
import { GameInfo } from './interfaces/game-info.interface';
import { Player } from './player.class';
import { Players } from './players-list.class';
import { IPushAction } from './interfaces/game-class.interfaces';

const TEAMS_ORDER = [Teams.red, Teams.red, Teams.blue, Teams.blue];
const POSITIONS_ORDER = [Positions.goalkeeper, Positions.forward, Positions.goalkeeper, Positions.forward];

interface IScore {
    [Teams.red]: number;
    [Teams.blue]: number;
}

interface IGame {
    id: ObjectId;
    title: string;
    players: Players;
    actions?: Action[];
    score?: IScore;
    status?: GameStatus;
    winner?: Teams;
    startedAt?: Date;
    finishedAt?: Date;
    totalPauseDuration?: number;
    lastPauseDate?: number;
    duration?: number;
    tournament?: ObjectId;
}

export class Game {
    id: ObjectId;

    private title: string;

    private players: Players;

    private actions: Action[];

    private score: IScore;

    private status: GameStatus;

    private winner: Teams | null;

    private startedAt: Date | null;

    private finishedAt: Date | null;

    private totalPauseDuration: number;

    private lastPauseDate: number | null;

    private duration: number;

    private tournament: ObjectId | null;

    static emitter: EventEmitter = new EventEmitter();

    constructor(game: IGame) {
        this.id = game.id;
        this.title = game.title;
        this.players = game.players;
        this.actions = game.actions || [];
        this.score = game.score || { [Teams.red]: 0, [Teams.blue]: 0 };
        this.status = game.status || GameStatus.DRAFT;
        this.winner = game.winner || null;
        this.startedAt = game.startedAt || null;
        this.finishedAt = game.finishedAt || null;
        this.totalPauseDuration = game.totalPauseDuration || 0;
        this.lastPauseDate = game.lastPauseDate || null;
        this.duration = game.duration || 0;
        this.tournament = game.tournament || null;
    }

    static wrapPlayers(teams: UserEntity[]) {
        const _players = teams.map(({ _id, name }: any, i: number) => new Player({
            _id,
            name,
            team: TEAMS_ORDER[i],
            position: POSITIONS_ORDER[i],
        }));

        return new Players(_players);
    }

    public start() {
        this.status = GameStatus.STARTED;
        this.startedAt = new Date();

        this.pushAction({ type: ActionType.START });

        return this;
    }

    private _score(team: Teams, callback: Function) {
        this.score[team] += 1;

        callback();

        if (this.score[team] === 10) {
            this.finish(team);
        }
    }

    public goal(id: any, enemy?: any) {
        if (this.status === GameStatus.PAUSED) throw new Error('Game is paused!');
        if (enemy) {
            const player = this.players.get(enemy);
            player.autogoal();

            const type = player.position === Positions.forward ? ActionType.AMGOAL : ActionType.ARGOAL;
            this.pushAction({ type, player });
        }

        const player = this.players.get(id);

        player.goal();
        this._score(player.team, () => {
            // Needs to be moved somewhere
            const type = player.position === Positions.forward ? ActionType.MGOAL : ActionType.RGOAL;
            this.pushAction({ type, player });
        });

        return this;
    }

    public pause() {
        if (this.status === GameStatus.PAUSED) return this;

        this.status = GameStatus.PAUSED;

        this.lastPauseDate = new Date().valueOf();
        this.pushAction({ type: ActionType.PAUSE });

        return this;
    }

    public unpause() {
        if (this.status !== GameStatus.PAUSED) return this;

        this.status = GameStatus.UNPAUSED;
        this.totalPauseDuration += Date.now() - this.lastPauseDate!;
        this.pushAction({ type: ActionType.RESUME });

        return this;
    }

    public swap(id: any) {
        const player = this.players.get(id);
        const teamate = this.players.getTeamate(id);
        const { position } = player;

        player.position = teamate.position;
        teamate.position = position;

        this.pushAction({ type: ActionType.SWAP, player });

        return this;
    }

    public pushAction({ type, player }: IPushAction) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { actions, ...info } = this.info();

        const action = new Action({
            type,
            player: player && Object.assign(Object.create(Object.getPrototypeOf(player)), player) as Player,
            info,
            game: new ObjectId(this.id),
            startedAt: this.startedAt!,
            id: new ObjectId(),
        });

        this.actions.push(action);

        this.emit('action', {
            type,
            player,
            info,
            actions: this.actions,
        });
    }

    public cancel(id: ObjectId) {
        const index = this.actions.findIndex((_action: Action) => _action.id.toString() === id.toString());
        const action = this.actions[index];

        if (action?.player) {
            action.player.cancel(action.type, action.player.position);

            if ([ActionType.MGOAL, ActionType.RGOAL].includes(action.type)) {
                this.score[action.player.team] -= 1;
            }

            this.actions.splice(index, 1);
        }

        return this;
    }

    private finish(team: Teams) {
        if (this.status === GameStatus.DRAFT) throw new Error('Game has not started yet!');

        this.winner = team;
        this.finishedAt = new Date();
        this.status = GameStatus.FINISHED;
        this.duration = this.finishedAt.valueOf() - this.startedAt!.valueOf() - this.totalPauseDuration;
        this.pushAction({ type: ActionType.FINISH });
        this.emit('finish', { info: this.info() });
    }

    private emit(event: string, data: any = {}) {
        return Game.emitter.emit(event, { ...data, gameId: this.id });
    }

    public info(): GameInfo {
        return {
            id: this.id,
            title: this.title,
            players: this.players.toArray().map((player) => ({ ...player } as Player)),
            actions: this.actions,
            score: { ...this.score },
            status: this.status,
            winner: this.winner,
            startedAt: this.startedAt,
            finishedAt: this.finishedAt,
            duration: this.duration,
            tournament: this.tournament,
        };
    }
}
