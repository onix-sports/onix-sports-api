import {
    Body, Controller, Get, Param, Post, Query,
} from '@nestjs/common';
import {
    ApiBody, ApiParam, ApiQuery, ApiTags,
} from '@nestjs/swagger';
import { ParseNumberPipe } from '@pipes/number.pipe';
import { ParseObjectIdPipe } from '@pipes/objectId.pipe';
import { ObjectId } from 'mongodb';
import CreateGamesDto from './dto/create-game.dto';
import { GamesService } from './games.service';

@ApiTags('Games')
@Controller('games')
export class GamesController {
    constructor(
    private readonly gameService: GamesService,
    ) {}

  @Get('/:id')
  @ApiParam({ name: 'id', type: String })
    public async getGameInfo(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    ) {
        return this.gameService.getGameInfo(id);
    }

  @Post('/')
  @ApiBody({ type: CreateGamesDto })
  public async createGames(@Body() gamesDto: CreateGamesDto) {
      const games = await this.gameService.createGames(gamesDto);

      return games;
  }

  @ApiQuery({
      name: 'limit',
      required: false,
  })
  @ApiQuery({
      name: 'skip',
      required: false,
  })
  @ApiQuery({
      name: 'tournament',
      required: false,
      type: String,
  })
  @Get('/')
  public async getGames(
    @Query('limit', ParseNumberPipe) limit?: number,
    @Query('skip', ParseNumberPipe) skip?: number,
    @Query('tournament', ParseObjectIdPipe) tournament?: ObjectId,
  ) {
      return this.gameService.getGames({ tournament }, limit, skip);
  }
}
