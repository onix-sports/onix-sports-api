import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '../enum/action-type.enum';
import { Positions } from '../enum/positions.enum';
import { Teams } from '../enum/teams.enum';

export class Player {
    @ApiProperty({ type: String })
    _id: any;

    @ApiProperty({ type: String })
    name: any;

    @ApiProperty({ type: Number })
    mGoals: any;

    @ApiProperty({ type: Number })
    rGoals: any;

    @ApiProperty({ type: Number })
    amGoals: any;

    @ApiProperty({ type: Number })
    arGoals: any;

    @ApiProperty({ type: String })
    team: Teams;

    @ApiProperty({ type: String })
    position: any;

    constructor({
        _id, name, team, position, mGoals = 0, rGoals = 0, amGoals = 0, arGoals = 0,
    }: any) {
        this._id = _id.toString();
        this.name = name;
        this.mGoals = mGoals;
        this.rGoals = rGoals;
        this.amGoals = amGoals;
        this.arGoals = arGoals;
        this.team = team;
        this.position = position;
    }

    public goal() {
        if (this.position === Positions.forward) {
            this.mGoals += 1;
        } else {
            this.rGoals += 1;
        }
    }

    public autogoal() {
        if (this.position === Positions.forward) {
            this.amGoals += 1;
        } else {
            this.arGoals += 1;
        }
    }

    public cancel(type: ActionType, position: Positions) {
        if ([ActionType.AMGOAL, ActionType.ARGOAL].includes(type)) {
            if (position === Positions.forward) {
                this.amGoals -= 1;
            } else {
                this.arGoals -= 1;
            }
        }

        if ([ActionType.MGOAL, ActionType.RGOAL].includes(type)) {
            if (position === Positions.forward) {
                this.mGoals -= 1;
            } else {
                this.rGoals -= 1;
            }
        }
    }
}
