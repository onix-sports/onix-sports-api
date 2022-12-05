import { LeaderboardEntity } from '@components/common/interfaces/leaderboard-entity.interface';
import { StatisticsService } from '@components/statistics/services/statistics.service';
import { Injectable } from '@nestjs/common';

const firstSeasson = new Date(2021, 9, 1);
@Injectable()
export class SeassonsService {
    constructor(
        public readonly statisticsService: StatisticsService,
    ) {}

    private getSeassonDateRange(number: number) {
        const month = firstSeasson.getMonth() + number * 3;
        const year = firstSeasson.getFullYear() + Math.floor(month / 12);

        return {
            dateFrom: new Date(year, month % 12, 1),
            dateTo: new Date(year, (month % 12) + 3, 0),
        };
    }

    private formatSeasson(seassons: LeaderboardEntity[][]) {
        return seassons.map((players, index, array) => ({
            number: array.length - index,
            maxScore: this.statisticsService.calculateMaxScore(players),
            isWeak: this.statisticsService.isWeakSeasson(players),
            players: players.filter(this.statisticsService.filterParticipiants(players)),
            ...this.getSeassonDateRange(array.length - index - 1),
        }));
    }

    async getSeassons() {
        const promises = [];
        let i = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { dateFrom, dateTo } = this.getSeassonDateRange(i);

            if (dateTo.valueOf() > Date.now()) break;

            promises.push(
                this.statisticsService.getLeaderboard(dateFrom, dateTo),
            );

            i += 1;
        }

        return Promise
            .all(promises.reverse())
            .then(this.formatSeasson.bind(this));
    }
}
