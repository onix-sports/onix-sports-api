import { TournamentDocument } from '@components/v1/tournaments/schemas/tournament.schema';
import fs from 'fs';
import Handlebars from 'handlebars';

export const tenPlayersTemplate = (
    { players: [p1, p2, p3, p4, p5, p6], teams, tournament } : { players: any[], teams: any[], tournament: TournamentDocument },
) => {
    const hbs = fs.readFileSync(`${process.cwd()}/src/components/v1/notification-listeners/tournaments/templates/10-players.hbs`, {
        encoding: 'utf-8',
    });
    const _teams = teams.map((team) => ({ ...team, chance: team.chance.toFixed(2) }));

    return Handlebars.compile(hbs)({ players: [p1, p2, p3, p4, p5, p6], teams: _teams, tournament }, { allowProtoPropertiesByDefault: true });
};
