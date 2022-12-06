import {
    Body, Controller, Get, Patch, Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { GetFakeStatsDto } from '../dto/get-fake-stats.dto';
import FakeStatsDto from '../dto/set-fake-stats.dto';
import { FakeStatisticsService } from '../services/fake-statistics.service';

@ApiTags('Fake statistics')
@Controller('statistics')
export class FakeStatisticsController {
    constructor(
    private readonly fakeStatisticsService: FakeStatisticsService,
    ) {}

    @Get('/fake')
    @ApiQuery({
        name: 'users',
        type: String,
        isArray: true,
    })
    public getStats(@Query(validationPipe) { users }: GetFakeStatsDto) {
        return this.fakeStatisticsService.getStats(users);
    }

    @Patch('/fake')
    public setStats(@Body() { user, ...fakeStatsDto }: FakeStatsDto) {
        return this.fakeStatisticsService.setStats(user, { ...fakeStatsDto });
    }
}
