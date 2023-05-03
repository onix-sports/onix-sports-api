import { Action } from '@components/v1/games/core/action.class';
import { IActionEventData } from '@components/v1/games/core/interfaces/action-event-data.interface';
import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';
import { ActionType } from '@components/v1/games/enum/action-type.enum';
import { GamesGateway } from '@components/v1/games/games.gateway';
import { WsExceptionFilter } from '@filters/ws-exception.filter';
import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway,
} from '@nestjs/websockets';
import { ObjectId } from 'mongodb';
import { authors } from './authors';
import { IMessage } from './interfaces/message.interface';
import { Message, messages } from './messages';
import { Game } from '../../core/game.class';

@Injectable()
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ transports: ['websocket'] })
export class ChatExtention implements OnGatewayInit {
    constructor(
    private readonly gameGateway: GamesGateway,
    ) {}

    private readonly logger: Logger = new Logger(ChatExtention.name);

    private readonly chats: {[key: string]: { messages: IMessage[], info?: GameInfo, interval: NodeJS.Timeout, actions?: Action[] }} = {};

    afterInit() {
        Game.emitter.on('action', ({ gameId }: { gameId: ObjectId }) => {
            // @TODO: fix chat extention after using redis
        });
    }

    @OnEvent('game.started')
    private handleStart({ id, info }: { id: string, info: GameInfo }) {
        this.gameGateway.emitter.on('action', this.handleAction.bind(this));

        const interval = setInterval(this.chatAI.bind(this), 100, id);

        this.chats[id] = {
            messages: [], interval, info, actions: info.actions,
        };
    }

    @OnEvent('game.finished')
    private handleFinish({ id }: { id: ObjectId }) {
        clearInterval(this.chats[id.toString()]?.interval);

        delete this.chats[id.toString()];
    }

    @SubscribeMessage('chat.message')
    private handleMessage(@MessageBody() { text, author }: { text: string, author: string }) {
        if (!text || !author) return;

        this.gameGateway.server.emit('chat.message', {
            text, author, time: new Date(),
        });
    }

    private handleAction(data: IActionEventData) {
        const chat = this.chats[data.info.id.toString()];

        if (!chat) return;

        chat.info = data.info;
        chat.actions = data.actions;
    }

    private getRandomFrom(array: any[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

    private chatAI(id: string) {
        const { actions } = this.chats[id];

        if (!actions) return;

        const lastAction = actions[actions.length - 1];
        const preLastAction = actions[actions.length - 2];
        let messagesArray: Message[] = [];

        switch (lastAction.type) {
        case ActionType.MGOAL:
            if (Date.now() - lastAction.time.valueOf() > 5000 || Math.random() < 0.35) break;

            messagesArray = messages[ActionType.MGOAL];
            break;
        case ActionType.RGOAL:
            if (Date.now() - lastAction.time.valueOf() > 5000 || Math.random() < 0.35) break;

            messagesArray = messages[ActionType.RGOAL];
            break;
        case ActionType.START:
            if (Date.now() - lastAction.time.valueOf() > 5000 || Math.random() < 0.35) break;

            messagesArray = messages[ActionType.START];
            break;
        case ActionType.PAUSE:
            if (Math.random() < 0.8) break;

            messagesArray = messages[ActionType.PAUSE];
            break;
        case ActionType.RESUME:
            if (Date.now() - lastAction.time.valueOf() > 5000 || Math.random() < 0.35) break;

            messagesArray = messages[ActionType.RESUME];
            break;
        case ActionType.SWAP:
            if (Date.now() - lastAction.time.valueOf() > 3000 || Math.random() < 0.35) break;

            messagesArray = messages[ActionType.SWAP];
            break;
        default: break;
        }

        switch (preLastAction?.type) {
        case ActionType.AMGOAL:
            if (Date.now() - lastAction.time.valueOf() > 5000 || Math.random() < 0.35) break;

            messagesArray = messages[ActionType.AMGOAL];
            break;
        case ActionType.ARGOAL:
            if (Date.now() - lastAction.time.valueOf() > 5000 || Math.random() < 0.35) break;

            messagesArray = messages[ActionType.ARGOAL];
            break;
        default: break;
        }

        if (Math.random() > 0.95 && Date.now() - lastAction.time.valueOf() > 5000) {
            messagesArray = messages.idle;
        }

        if (!messagesArray.length) return;

        const text = this.getRandomFrom(messagesArray)(preLastAction?.player?.name || lastAction?.player?.name);
        const author = this.getRandomFrom(authors);

        this.gameGateway.server.emit('chat.message', {
            text, author, time: new Date(),
        });
    }
}
