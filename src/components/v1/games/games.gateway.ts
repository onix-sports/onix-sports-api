import { WsExceptionFilter } from '@filters/ws-exception.filter';
import { Logger, UseFilters } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    ConnectedSocket,
    MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import validationPipe from '@pipes/validation.pipe';
import { Server, Socket } from 'socket.io';
import RequestUser from '@decorators/request-user.decorator';
import WsAuthorized from '@decorators/ws-authorized.decorator';
import { GameEventDto } from './dto/game-event.dto';
import { GameIdDto } from './dto/start-game.dto';
import { GameProcessService } from './game-process.service';
import { IFinish } from './interfaces/games-gateway.interfaces';
import JwtPayloadDto from '../auth/dto/jwt-payload.dto';

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

    @WsAuthorized()
    @SubscribeMessage('start')
    public async start(@MessageBody(validationPipe) { id }: GameIdDto, @RequestUser() user: JwtPayloadDto): Promise<void> {
        await this.gameProcessService.start(user._id, id);

        const data = await this.gameProcessService.info(id);

        this.logger.log(`Game ${id} started`);

        this.server.to(id.toString()).emit('data', data);
        this.eventEmitter.emit('game.started', { id, info: data });
    }

    @WsAuthorized()
    @SubscribeMessage('goal')
    public async goal(@MessageBody() { id, playerId, enemyId }: GameEventDto, @RequestUser() user: JwtPayloadDto): Promise<void> {
        const data = await this.gameProcessService.goal(user._id, id, playerId, enemyId);

        this.server.to(id.toString()).emit('data', data);
    }

    @WsAuthorized()
    @SubscribeMessage('pause')
    public async pause(@MessageBody(validationPipe) { id }: GameEventDto, @RequestUser() user: JwtPayloadDto): Promise<void> {
        const data = await this.gameProcessService.pause(user._id, id);

        this.server.to(id.toString()).emit('data', data);
    }

    @WsAuthorized()
    @SubscribeMessage('cancel')
    public async cancel(@MessageBody(validationPipe) { id, actionId }: GameEventDto, @RequestUser() user: JwtPayloadDto): Promise<void> {
        const data = await this.gameProcessService.cancel(user._id, id, actionId);

        this.server.to(id.toString()).emit('data', data);
    }

    @WsAuthorized()
    @SubscribeMessage('swap')
    public async swap(@MessageBody() { id, playerId }: GameEventDto, @RequestUser() user: JwtPayloadDto): Promise<void> {
        const data = await this.gameProcessService.swap(user._id, id, playerId);

        this.server.to(id.toString()).emit('data', data);
    }

    @WsAuthorized()
    @SubscribeMessage('finish')
    public async finish(@MessageBody() { id }: GameEventDto, @RequestUser() user: JwtPayloadDto): Promise<void> {
        const data = await this.gameProcessService.finish(user._id, id);

        this.server.to(id.toString()).emit('data', data);
        this.server.socketsLeave(id.toString());
    }

    @SubscribeMessage('data')
    public async data(@MessageBody(validationPipe) { id }: GameEventDto) {
        const data = await this.gameProcessService.info(id);

        this.server.to(id.toString()).emit('data', data);
    }

    @SubscribeMessage('join')
    public async join(@MessageBody(validationPipe) { id }: GameEventDto, @ConnectedSocket() client: Socket) {
        await client.join(id.toString());

        const data = await this.gameProcessService.info(id).catch(() => null);

        if (data) {
            this.server.to(id.toString()).emit('data', data);
        }

        this.logger.log(`Client ${client.id} connected to the Game ${id}`);

        return {};
    }
}
