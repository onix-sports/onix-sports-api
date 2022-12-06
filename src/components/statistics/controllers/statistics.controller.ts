import {
    Controller, Get, Param, Query,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { GetLeaderboardDto } from '../dto/get-leaderboard.dto';
import { GetProfileDto } from '../dto/get-profile.dto';
import { GetStatsDto } from '../dto/get-stats.dto';
import { GetTournamentDto } from '../dto/get-tournament.dto';
import { StatisticsService } from '../services/statistics.service';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(
    private readonly statisticService: StatisticsService,
    ) {}

    @ApiQuery({ name: 'ids', type: [String], required: false })
    @ApiQuery({ name: 'dateFrom', type: Number, required: false })
    @ApiQuery({ name: 'dateTo', type: Number, required: false })
    @Get('/')
    public getStats(@Query(validationPipe) { ids, dateFrom, dateTo }: GetStatsDto) {
        return this.statisticService.getStatsPeriod(ids, dateFrom, dateTo);
    }

    @ApiQuery({ name: 'dateFrom', type: Number, required: false })
    @ApiQuery({ name: 'dateTo', type: Number, required: false })
    @Get('/leaderboard')
    public getLeaderboard(@Query(validationPipe) { dateFrom, dateTo }: GetLeaderboardDto) {
        return this.statisticService.getLeaderboard(dateFrom, dateTo);
    }

    @ApiParam({
        name: 'tournament',
        type: String,
    })
    @Get('/:tournament')
    public getTournamentStats(@Param(validationPipe) { id }: GetTournamentDto) {
        return this.statisticService.getTournamentStats(id);
    }

    @ApiParam({
        name: 'id',
        type: String,
        required: false,
    })
    @Get('/profile/:id')
    public async getProfileStats(@Param(validationPipe) { id }: GetProfileDto) {
        return this.statisticService.getProfileStats(id);
    }
}
