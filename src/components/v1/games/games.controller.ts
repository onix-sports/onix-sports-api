import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import Authorized from '@decorators/authorized.decorator';
import RequestUser from '@decorators/request-user.decorator';
import OrganizationGuard from '@guards/organization.guard';
import {
    Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import validationPipe from '@pipes/validation.pipe';
import { ObjectId } from 'mongodb';
import { EventEmitter2 } from '@nestjs/event-emitter';
import SelectedOrganization from '@decorators/selected-organization.decorator';
import JwtPayloadDto from '../auth/dto/jwt-payload.dto';
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
    private readonly eventEmitter: EventEmitter2,
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
        `Tournament with id ${new ObjectId().toString()} was not found`,
        `Player with id ${new ObjectId().toString()} was not found`,
        `Organization with id ${new ObjectId().toString()} was not found`,
    ])
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Post('/')
    public async createGames(
        @Body() gamesDto: CreateGamesDto,
        @RequestUser() user: JwtPayloadDto,
        @SelectedOrganization() organization: ObjectId,
    ) {
        const games = await this.gameService.createGames({ ...gamesDto, organization }, user._id);

        if (gamesDto.tournament) {
            await this.eventEmitter.emitAsync('tournament.game.created', { tournament: gamesDto.tournament });
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
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Get('/')
    public async getGames(
        @Query(validationPipe) { tournament, limit, skip }: GetGamesDto,
        @SelectedOrganization() organization: ObjectId,
    ) {
        return this.gameService.getGames({ tournament, organization }, limit, skip);
    }
}
