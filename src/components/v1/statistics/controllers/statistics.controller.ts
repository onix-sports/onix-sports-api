import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import {
    Controller, Get, HttpCode, HttpStatus, Param, Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { GetLeaderboardDto } from '../dto/get-leaderboard.dto';
import { GetProfileDto } from '../dto/get-profile.dto';
import { GetStatsDto } from '../dto/get-stats.dto';
import { GetTournamentDto } from '../dto/get-tournament.dto';
import { GroupedStatistic } from '../dto/grouped-statistic.dto';
import { LeaderboardStatistic } from '../dto/leaderboard-statistic.dto';
import { StatisticsService } from '../services/statistics.service';

@ApiTags('Statistics')
@ApiExtraModels(GroupedStatistic, LeaderboardStatistic)
@Controller('statistics')
export class StatisticsController {
    constructor(
    private readonly statisticService: StatisticsService,
    ) {}

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(GroupedStatistic),
            },
        },
        description: 'Returns statistics for selected users. Be default return statistics for all time',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/')
    public getStats(@Query(validationPipe) { ids, dateFrom, dateTo }: GetStatsDto) {
        return this.statisticService.getStatsPeriod(ids, dateFrom, dateTo);
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(LeaderboardStatistic),
            },
        },
        description: 'Returns leaderboard statistics.',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/leaderboard')
    public getLeaderboard(@Query(validationPipe) { dateFrom, dateTo }: GetLeaderboardDto) {
        return this.statisticService.getLeaderboard(dateFrom, dateTo);
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(GroupedStatistic),
            },
        },
        description: 'Returns statistics for specific tournament.',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/:tournament')
    public getTournamentStats(@Param(validationPipe) { tournament }: GetTournamentDto) {
        return this.statisticService.getTournamentStats(tournament);
    }

    @ApiResponse({
        description: 'Returns statistics for profile page',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Profile statistics not found')
    @HttpCode(HttpStatus.OK)
    @Get('/profile/:id')
    public async getProfileStats(@Param(validationPipe) { id }: GetProfileDto) {
        return this.statisticService.getProfileStats(id);
    }
}
