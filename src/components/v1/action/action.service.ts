import { GameInfo } from '@components/v1/games/core/interfaces/game-info.interface';
import { GamesService } from '@components/v1/games/games.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActionRepository } from './action.repository';

@Injectable()
export class ActionService {
    constructor(
    private readonly actionRepository: ActionRepository,
    private readonly gamesService: GamesService,
    ) {}

  @OnEvent('game.finished')
    public async create({ info }: { info: GameInfo }) {
        if (!info.actions) return [];

        const _actions = await this.actionRepository.create(info.actions);

        await this.gamesService.pushActions(info.id, _actions.map(({ _id }) => _id));

        return _actions;
    }
}
