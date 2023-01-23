import fs from 'fs';
import Handlebars from 'handlebars';

export const respectedPlayerTemplate = (context: { name: string, avatarUrl: string, respects: number }) => {
    const hbs = fs.readFileSync(`${process.cwd()}/src/components/v1/notification-listeners/tournaments/templates/respected.hbs`, {
        encoding: 'utf-8',
    });

    return Handlebars.compile(hbs)(context, { allowProtoPropertiesByDefault: true });
};
