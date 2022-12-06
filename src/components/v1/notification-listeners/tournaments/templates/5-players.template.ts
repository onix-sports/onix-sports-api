import { TournamentDocument } from '@components/v1/tournaments/schemas/tournament.schema';
import fs from 'fs';
import Handlebars from 'handlebars';

export const fivePlayersTemplate = ({ players: [p1, p2, p3, p4, p5], tournament } : { players: any[], teams: any[], tournament: TournamentDocument
  }) => {
    const hbs = fs.readFileSync(`${process.cwd()}/src/components/notification-listeners/tournaments/templates/5-players.hbs`, {
        encoding: 'utf-8',
    });

    return Handlebars.compile(hbs)({ players: [p1, p2, p3, p4, p5], tournament }, { allowProtoPropertiesByDefault: true });
};
