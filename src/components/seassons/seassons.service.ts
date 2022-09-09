import { LeaderboardEntity } from '@components/common/interfaces/leaderboard-entity.interface';
import { lessThan } from '@components/common/utils/less-than';
import { log } from '@components/common/utils/log';
import { pipe } from '@components/common/utils/pipe';
import { StatisticsService } from '@components/statistics/statistics.service';
import { Injectable } from '@nestjs/common';

const firstSeasson = new Date(2021, 9, 1);
const MINIMUM_GAMES = 0;
const WEAK_SEASSON_MINIMUM_GAMES = 0;

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

    private filterByGames(games: number) {
        return (player: LeaderboardEntity) => player.games >= games;
    }

    private averageGameCount(players: LeaderboardEntity[]) {
        return players.reduce((acc, val, index, array) => acc + val.games / array.length, 0);
    }

    private filterBySeassonMinimumGames(isWeak: boolean) {
        return this.filterByGames(isWeak ? WEAK_SEASSON_MINIMUM_GAMES : MINIMUM_GAMES);
    }

    private isWeakSeasson = pipe(
        this.averageGameCount,
        lessThan(MINIMUM_GAMES),
    );

    private filterParticipiants = pipe(
        this.isWeakSeasson,
        this.filterBySeassonMinimumGames.bind(this),
    );

    private formatSeasson(seassons: LeaderboardEntity[][]) {
        return seassons.map((players, index, array) => ({
                number: array.length - index,
                maxScore: players.length * 2,
                isWeak: this.isWeakSeasson(players),
                players: players.filter(this.filterParticipiants(players)),
                ...this.getSeassonDateRange(array.length - index - 1),
            }));
    }

    async getSeassons() {
        const promises = [];
        let i = 0;

        while (true) {
            const { dateFrom, dateTo } =  this.getSeassonDateRange(i);

            if (dateTo.valueOf() > Date.now()) break;

            promises.push(
                this.statisticsService.getLeaderboard(dateFrom, dateTo)
            );

            i++;
        }

        return Promise
            .all(promises.reverse())
            .then(this.formatSeasson.bind(this));
    }
}
