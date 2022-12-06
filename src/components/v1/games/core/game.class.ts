import EventEmitter from 'events';
import { ObjectId } from 'mongodb';
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
import { IActionEventData } from './interfaces/action-event-data.interface';

const TEAMS_ORDER = [Teams.red, Teams.red, Teams.blue, Teams.blue];
const POSITIONS_ORDER = [Positions.goalkeeper, Positions.forward, Positions.goalkeeper, Positions.forward];

export class Game {
    id: any;

    private title: string = '';

    private players: Players = new Players([]);

    private actions: Action[] = [];

    private score = { [Teams.red]: 0, [Teams.blue]: 0 };

    private status: GameStatus = GameStatus.STARTED;

    private winner: Teams;

    private startedAt = new Date();

    private finishedAt: Date = new Date();

    private totalPauseDuration: number = 0;

    private lastPauseDate: number = 0;

    private duration: number = 0;

    private tournament: ObjectId;

    emitter: EventEmitter = new EventEmitter();

    constructor({
        id, teams, title, emitter, tournament,
    }: any) {
        const _players = teams.map(({ _id, name }: any, i: number) => new Player({
            _id,
            name,
            team: TEAMS_ORDER[i],
            position: POSITIONS_ORDER[i],
        }));

        this.id = id;
        this.title = title;
        this.players = new Players(_players);
        this.emitter = emitter;
        this.tournament = tournament;

        this.pushAction({ type: ActionType.START });
    }

    static create(gameObj: any) {
        return new Game(gameObj);
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
        if (this.status === GameStatus.UNPAUSED) return this;

        this.status = GameStatus.UNPAUSED;

        this.totalPauseDuration += Date.now() - this.lastPauseDate;
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
            player: { ...player } as Player | undefined,
            info,
            game: new ObjectId(this.id),
            startedAt: this.startedAt,
            id: Date.now(),
        });

        this.actions.push(action);
        this.emitter.emit(gameEvent(this.id, 'action'), {
            type, player, info, actions: this.actions,
        } as IActionEventData);
    }

    public cancel(id: number) {
        const action = this.actions.find((_action: Action) => _action.id === id);
        const index = this.actions.findIndex((_action: Action) => _action.id === id);

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
        this.winner = team;
        this.finishedAt = new Date();
        this.status = GameStatus.FINISHED;

        this.duration = this.finishedAt.valueOf() - this.startedAt.valueOf() - this.totalPauseDuration;

        this.pushAction({ type: ActionType.FINISH });
        this.emitter.emit(gameEvent(this.id, 'finish'));
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
