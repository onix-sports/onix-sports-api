import {
    Body, Controller, Get, Param, Post, Query,
} from '@nestjs/common';
import {
    ApiBody, ApiParam, ApiQuery, ApiTags,
} from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import CreateGamesDto from './dto/create-game.dto';
import { GetGameDto } from './dto/get-game.dto';
import { GetGamesDto } from './dto/get-games.dto';
import { GamesService } from './games.service';

@ApiTags('Games')
@Controller('games')
export class GamesController {
    constructor(
    private readonly gameService: GamesService,
    ) {}

    @Get('/:id')
    @ApiParam({ name: 'id', type: String })
    public async getGameInfo(@Param(validationPipe) params: GetGameDto) {
        return this.gameService.getGameInfo(params.id);
    }

    @Post('/')
    @ApiBody({ type: CreateGamesDto })
    public async createGames(@Body() gamesDto: CreateGamesDto) {
        return this.gameService.createGames(gamesDto);
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
        @Query(validationPipe) { tournament, limit, skip }: GetGamesDto,
    ) {
        return this.gameService.getGames({ tournament }, limit, skip);
    }
}
