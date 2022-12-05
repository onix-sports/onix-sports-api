import Authorized from '@decorators/authorized.decorator';
import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParseDatePipe } from '@pipes/date.pipe';
import { ParseObjectIdPipe } from '@pipes/objectId.pipe';
import { ObjectIdsPipe } from '@pipes/objectIds.pipe';
import { ObjectId } from 'mongodb';
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
  public getStats(
    @Query('ids', ObjectIdsPipe) ids: ObjectId[],
    @Query('dateFrom', ParseDatePipe) dateFrom: Date,
    @Query('dateTo', ParseDatePipe) dateTo: Date,
  ) {
    return this.statisticService.getStatsPeriod(ids, dateFrom, dateTo);
  }

  @ApiQuery({ name: 'dateFrom', type: Number, required: false })
  @ApiQuery({ name: 'dateTo', type: Number, required: false })
  @Get('/leaderboard')
  public getLeaderboard(
    @Query('dateFrom', ParseDatePipe) dateFrom: any,
    @Query('dateTo', ParseDatePipe) dateTo: any,
  ) {
    return this.statisticService.getLeaderboard(dateFrom, dateTo);
  }

  @ApiParam({
    name: 'tournament',
    type: String,
  })
  @Get('/:tournament')
  public getTournamentStats(
    @Param('tournament', ParseObjectIdPipe) id: ObjectId,
  ) {
    return this.statisticService.getTournamentStats(id);
  }

  @ApiParam({
    name: 'id',
    type: String,
    required: false
  })
  @Get('/profile/:id')
  @Authorized()
  public async getProfileStats(@Param('id', ParseObjectIdPipe) id: ObjectId, @Req() req: any) {
    return this.statisticService.getProfileStats(id);
  }

  // @Get('/profile')
  // @Authorized()
  // public async getProfileStatsByUser(@Req() req: any) {
  //   console.log(req.user);
  //   return this.statisticService.getProfileStats(req.user._id);
  // }
}
