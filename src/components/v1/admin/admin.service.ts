import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ActionRepository } from '../action/action.repository';
import GamesRepository from '../games/games.repository';
import StatisticsRepository from '../statistics/repositories/statistics.repository';
import { StatisticsService } from '../statistics/services/statistics.service';
import { TournamentService } from '../tournaments/tournament.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly gamesRepository: GamesRepository,
        private readonly actionRepository: ActionRepository,
        private readonly statisticsRepository: StatisticsRepository,
        private readonly statisticsService: StatisticsService,
        private readonly tournamentService: TournamentService,
    ) {}

    public async deleteGame(id: ObjectId) {
        const [game] = await Promise.all([
            this.gamesRepository.deleteById(id),
            this.actionRepository.deleteByGame(id),
            this.statisticsRepository.deleteByGame(id),
        ]);

        if (!game) {
            throw new NotFoundException('Game not found');
        }

        const promises: Promise<any>[] = [this.statisticsService.updateGamesProfileStats()];

        if (game.tournament) {
            promises.push(
                this.tournamentService.removeGame(game.tournament, id),
            );
        }

        return Promise.all(promises);
    }
}
