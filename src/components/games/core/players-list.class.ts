import { Player } from './player.class';

export class Players {
    private players: Player[] = [];

    constructor(players: Player[]) {
        this.players = players;
    }

    public get(id: any) {
        const player = this.players.find(({ _id }: Player) => _id === id);

        if (!player) throw new Error('Player was not found');

        return player;
    }

    public getTeamate(id: any) {
        const _team = this.get(id).team;
        const player = this.players.find(({ _id, team }: any) => _id !== id && team === _team);

        if (!player) throw new Error('Player was not found');

        return player;
    }

    public toArray() {
        return this.players;
    }
}
