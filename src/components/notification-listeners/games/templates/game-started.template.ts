import { MessageArguments } from '@components/common/types/message-arguments.type';
import { Markup } from 'telegraf';

export const gameStartedTemplate = ({ players, _id }: any): MessageArguments => {
    const APP_URL = process.env.APP_URL?.includes('localhost:3000')
        ? process.env.APP_URL?.replace('localhost:3000', 'onix-sports.herokuapp.com')
        : process.env.APP_URL;

    return [
        `Game *${players[0].name} ${players[1].name}* vs *${players[2].name} ${players[3].name}* started\\!`,
        {
            parse_mode: 'MarkdownV2',
            reply_markup: Markup.inlineKeyboard([
                Markup.button.url('Watch', `${APP_URL}/games/${_id}/watch`),
                Markup.button.callback('Notify on end', 'notify_on_end'),
            ]).reply_markup,
            disable_notification: true,
        },
    ];
};
