import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ActionRepository } from '../action/action.repository';
import GamesRepository from '../games/games.repository';
import StatisticsRepository from '../statistics/repositories/statistics.repository';
import { StatisticsService } from '../statistics/services/statistics.service';
import { TournamentService } from '../tournaments/tournament.service';
import { TournamentRepository } from '../tournaments/tournament.repository';

@Injectable()
export class AdminService {
    constructor(
        private readonly gamesRepository: GamesRepository,
        private readonly actionRepository: ActionRepository,
        private readonly statisticsRepository: StatisticsRepository,
        private readonly statisticsService: StatisticsService,
        private readonly tournamentService: TournamentService,
        private readonly tournamentRepository: TournamentRepository,
    ) {}

    public async deleteSingleGame(id: ObjectId) {
        const game = await this.deleteGame(id);
        const promises: Promise<any>[] = [
            this.statisticsService.updateGamesProfileStats(game.players),
        ];

        if (game.tournament) {
            promises.push(
                this.tournamentService.removeGame(game.tournament, id),
            );
        }

        return Promise.all(promises);
    }

    public async deleteGame(id: ObjectId) {
        const [game] = await Promise.all([
            this.gamesRepository.deleteById(id),
            this.actionRepository.deleteByGame(id),
            this.statisticsRepository.deleteByGame(id),
        ]);

        if (!game) {
            throw new NotFoundException('Game not found');
        }

        return game;
    }

    public async deleteTournament(id: ObjectId) {
        const tournament = await this.tournamentRepository.deleteById(id);

        if (!tournament) {
            throw new NotFoundException('Tournament not found');
        }

        await Promise.all(tournament.games.map((gameId) => this.deleteGame(gameId)));

        return this.statisticsService.updateGamesProfileStats(tournament.players);
    }
}
