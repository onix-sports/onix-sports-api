import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import Authorized from '@decorators/authorized.decorator';
import { RolesEnum } from '@decorators/roles.decorator';
import {
    Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import validationPipe from '@pipes/validation.pipe';
import { ObjectId } from 'mongodb';
import { TournamentService } from '../tournaments/tournament.service';
import CreateGamesDto from './dto/create-game.dto';
import { GetGameDto } from './dto/get-game.dto';
import { GetGamesDto } from './dto/get-games.dto';
import { GamesService } from './games.service';
import { Game } from './schemas/game.schema';

@ApiTags('Games')
@ApiExtraModels(Game)
@Controller('games')
export class GamesController {
    constructor(
    private readonly gameService: GamesService,
    private readonly tournamentService: TournamentService,
    ) {}

    @ApiResponse({
        properties: {
            $ref: getSchemaPath(Game),
        } as SchemaObject,
        description: 'Returns a game.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Game was not found')
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    public async getGameInfo(@Param(validationPipe) params: GetGameDto) {
        return this.gameService.getGameInfo(params.id);
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(Game),
            },
        },
        description: 'Creates a game. If game attached to tournament, tournament will be marked as custom.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse([
        `Tournament with id ${new ObjectId()} was not found`,
        `Player with id ${new ObjectId()} was not found`,
    ])
    @HttpCode(HttpStatus.CREATED)
    @Authorized(RolesEnum.admin)
    @Post('/')
    public async createGames(@Body() gamesDto: CreateGamesDto) {
        const games = await this.gameService.createGames(gamesDto);

        if (gamesDto.tournament) {
            await this.tournamentService.makeCustom(gamesDto.tournament);
        }

        return games;
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(Game),
            },
        },
        description: 'Returns games',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/')
    public async getGames(
        @Query(validationPipe) { tournament, limit, skip }: GetGamesDto,
    ) {
        return this.gameService.getGames({ tournament }, limit, skip);
    }
}
