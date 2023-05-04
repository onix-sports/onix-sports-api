import { WsExceptionFilter } from '@filters/ws-exception.filter';
import { Logger, UseFilters } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    ConnectedSocket,
    MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse,
} from '@nestjs/websockets';
import validationPipe from '@pipes/validation.pipe';
import { Server, Socket } from 'socket.io';
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
        this.emitter.on('finish', this._finish.bind(this));
        this.emitter.on('pending', this.pending.bind(this));
    }

    private _finish({ gameId, info }: IFinish) {
        this.server.to(gameId.toString()).emit('finish', { id: gameId, info });
    }

    private pending({ gameId, info }: IFinish) {
        this.server.to(gameId.toString()).emit('pending', { id: gameId, info });
    }

    @SubscribeMessage('start')
    public async start(@MessageBody(validationPipe) { id }: GameIdDto): Promise<void> {
        await this.gameProcessService.start(id);

        const data = await this.gameProcessService.info(id);

        this.server.to(id.toString()).emit('data', data);
        this.eventEmitter.emit('game.started', { id, info: data });
    }

    @SubscribeMessage('goal')
    public async goal(@MessageBody() { id, playerId, enemyId }: GameEventDto): Promise<void> {
        const data = await this.gameProcessService.goal(id, playerId, enemyId);

        this.server.to(id.toString()).emit('data', data);
    }

    @SubscribeMessage('pause')
    public async pause(@MessageBody(validationPipe) { id }: GameEventDto): Promise<void> {
        const data = await this.gameProcessService.pause(id);

        this.server.to(id.toString()).emit('data', data);
    }

    @SubscribeMessage('cancel')
    public async cancel(@MessageBody(validationPipe) { id, actionId }: GameEventDto): Promise<void> {
        const data = await this.gameProcessService.cancel(id, actionId);

        this.server.to(id.toString()).emit('data', data);
    }

    @SubscribeMessage('swap')
    public async swap(@MessageBody() { id, playerId }: GameEventDto): Promise<void> {
        const data = await this.gameProcessService.swap(id, playerId);

        this.server.to(id.toString()).emit('data', data);
    }

    @SubscribeMessage('finish')
    public async finish(@MessageBody() { id }: GameEventDto): Promise<void> {
        const data = await this.gameProcessService.finish(id);

        this.server.to(id.toString()).emit('data', data);
        this.server.socketsLeave(id.toString());
    }

    @SubscribeMessage('data')
    public async data(@MessageBody(validationPipe) { id }: GameEventDto): Promise<WsResponse<any>> {
        const data = await this.gameProcessService.info(id);

        return { event: 'data', data };
    }

    @SubscribeMessage('join')
    public async join(@MessageBody(validationPipe) { id }: GameEventDto, @ConnectedSocket() client: Socket): Promise<WsResponse<any>> {
        const data = await this.gameProcessService.info(id);

        await client.join(id.toString());

        return { event: 'data', data };
    }
}
