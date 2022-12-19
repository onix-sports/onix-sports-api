import fs from 'fs';
import Handlebars from 'handlebars';

export const tournamentPerformTemplate = (ctx: any) => {
    const hbs = fs.readFileSync(`${process.cwd()}/src/components/notification-listeners/statistics/templates/tournament.hbs`, {
        encoding: 'utf-8',
    });

    const caption = `
Statistics 2.0

GPG - ${ctx.name}'s goals per game
TOTAL - ${ctx.name}'s goals / all players goals

#bestperformer
#${ctx.name}
    `;

    return {
        html: Handlebars.compile(hbs)(ctx),
        caption,
    };
};
