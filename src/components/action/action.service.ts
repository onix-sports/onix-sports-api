import { GameInfo } from '@components/games/core/interfaces/game-info.interface';
import { GamesService } from '@components/games/games.service';
import { Game } from '@components/games/core/game.class';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActionRepository } from './action.repository';

@Injectable()
export class ActionService {
    constructor(
    private readonly actionRepository: ActionRepository,
    private readonly gamesService: GamesService,
    ) {}

  @OnEvent('games.finished')
    public async create({ info: { actions }, game: { id } }: { game: Game, info: GameInfo }) {
        if (!actions) return [];

        const _actions = await this.actionRepository.create(actions);

        await this.gamesService.pushActions(id, _actions.map(({ _id }) => _id));

        return _actions;
    }
}
