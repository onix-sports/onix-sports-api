import { WsExceptionFilter } from '@filters/ws-exception.filter';
import { Logger, UseFilters } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse,
} from '@nestjs/websockets';
import validationPipe from '@pipes/validation.pipe';
import { Server } from 'socket.io';
import { GameEventDto } from './dto/game-event.dto';
import { GameIdDto } from './dto/start-game.dto';
import { GameProcessService } from './game-process.service';
import { IFinish } from './interfaces/games-gateway.interfaces';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ transports: ['websocket'] })
export class GamesGateway implements OnGatewayInit {
    constructor(
    private readonly gameProcessService: GameProcessService,

    private readonly eventEmitter: EventEmitter2,
    ) {}

    @WebSocketServer()
    server: Server = new Server();

    private logger: Logger = new Logger(GamesGateway.name);

    get emitter() {
        return this.gameProcessService.emitter;
    }

    afterInit() {
        this.emitter.on('finish', this.finish.bind(this));
    }

    private finish({ gameId, info }: IFinish) {
        this.server.emit('finish', { id: gameId, info });
    }

    @SubscribeMessage('start')
    public async start(@MessageBody(validationPipe) { id }: GameIdDto): Promise<WsResponse> {
        await this.gameProcessService.start(id);

        const data = await this.gameProcessService.info(id);

        this.server.emit('data', data);
        this.eventEmitter.emit('game.started', { id, info: data });

        return { event: 'data', data };
    }

    @SubscribeMessage('goal')
    public async goal(@MessageBody() { id, playerId, enemyId }: GameEventDto): Promise<WsResponse<any>> {
        const data = await this.gameProcessService.goal(id, playerId, enemyId);

        this.server.emit('data', data);

        return { event: 'data', data };
    }

    @SubscribeMessage('pause')
    public async pause(@MessageBody(validationPipe) { id }: GameEventDto): Promise<WsResponse> {
        const data = await this.gameProcessService.pause(id);

        this.server.emit('data', data);

        return { event: 'data', data };
    }

    @SubscribeMessage('cancel')
    public async cancel(@MessageBody(validationPipe) { id, actionId }: GameEventDto): Promise<WsResponse<any>> {
        const data = await this.gameProcessService.cancel(id, actionId);

        this.server.emit('data', data);

        return { event: 'data', data };
    }

    @SubscribeMessage('swap')
    public async swap(@MessageBody() { id, playerId }: GameEventDto): Promise<WsResponse<any>> {
        const data = await this.gameProcessService.swap(id, playerId);

        this.server.emit('data', data);

        return { event: 'data', data };
    }

    @SubscribeMessage('data')
    public async data(@MessageBody(validationPipe) { id }: GameEventDto): Promise<WsResponse<any>> {
        const data = await this.gameProcessService.info(id);

        return { event: 'data', data };
    }
}
