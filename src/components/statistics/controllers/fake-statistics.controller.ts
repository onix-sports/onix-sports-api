import {
    Body, Controller, Get, Patch, Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ObjectIdsPipe } from '@pipes/objectIds.pipe';
import { ObjectId } from 'mongodb';
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
    public getStats(@Query('users', ObjectIdsPipe) users: any[]) {
        return this.fakeStatisticsService.getStats(users);
    }

  @Patch('/fake')
  public setStats(@Body() { user, ...fakeStatsDto }: FakeStatsDto) {
      return this.fakeStatisticsService.setStats(new ObjectId(user), { ...fakeStatsDto });
  }
}
