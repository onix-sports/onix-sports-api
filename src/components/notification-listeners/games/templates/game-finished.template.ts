import { MessageArguments } from '@components/common/types/message-arguments.type';
import { Teams } from '@components/games/enum/teams.enum';

export const gameFinishedTemplate = ({ players, score }: any): MessageArguments => {
    return [
        `
Game *${players[0].name} ${players[1].name}* vs *${players[2].name} ${players[3].name}* finished\\!
Score: ${score[Teams.red]} : ${score[Teams.blue]}
    `,
        {
            parse_mode: 'MarkdownV2',
        },
    ];
};
