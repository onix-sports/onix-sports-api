import {
    Body, Controller, Get, Param, Patch, Post, Query,
} from '@nestjs/common';
import {
    ApiBody, ApiParam, ApiQuery, ApiTags,
} from '@nestjs/swagger';
import { ParseNumberPipe } from '@pipes/number.pipe';
import { CloseTournamentDto } from './dto/close-tournament.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentService } from './tournament.service';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
    constructor(
    private readonly tournamentService: TournamentService,
    ) {}

  @ApiBody({ type: CreateTournamentDto })
  @Post('/')
    public createTournament(@Body() tournament: CreateTournamentDto) {
        return this.tournamentService.create(tournament);
    }

  @ApiBody({ type: CloseTournamentDto })
  @Patch('/close')
  public closeTournament(@Body('id') id: String) {
      return this.tournamentService.closeTournament(id);
  }

  @ApiQuery({
      name: 'status',
      type: String,
      required: false,
  })
  @ApiQuery({
      name: 'limit',
      type: Number,
      required: false,
  })
  @ApiQuery({
      name: 'skip',
      type: Number,
      required: false,
  })
  @Get('/')
  public getTournaments(
    @Query('status') status: string,
    @Query('skip', ParseNumberPipe) skip: number,
    @Query('limit', ParseNumberPipe) limit: number,
  ) {
      return this.tournamentService.getMany({ status, skip, limit });
  }

  @ApiParam({
      name: 'id',
      type: String,
  })
  @Get('/:id')
  public getTournament(@Param('id') id: String) {
      return this.tournamentService.getOne(id);
  }
}
