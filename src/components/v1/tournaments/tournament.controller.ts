import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import {
    Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import validationPipe from '@pipes/validation.pipe';
import { CloseTournamentDto } from './dto/close-tournament.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { GetTournamentDto } from './dto/get-tournament.dto';
import { GetTournamentsDto } from './dto/get-tournaments.dto';
import { Tournament } from './schemas/tournament.schema';
import { TournamentService } from './tournament.service';

@ApiTags('Tournaments')
@ApiExtraModels(Tournament)
@Controller('tournaments')
export class TournamentController {
    constructor(
    private readonly tournamentService: TournamentService,
    ) {}

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(Tournament),
        } as SchemaObject,
        description: 'Creates a new tournament (without games and players)',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.CREATED)
    @Post('/')
    public createTournament(@Body() tournament: CreateTournamentDto) {
        return this.tournamentService.create(tournament);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(Tournament),
        } as SchemaObject,
        description: 'Closes a tournament',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Patch('/close')
    public closeTournament(@Body() { id }: CloseTournamentDto) {
        return this.tournamentService.closeTournament(id);
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(Tournament),
            },
        },
        description: 'Returns tournaments by status',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/')
    public getTournaments(@Query(validationPipe) { status, skip, limit }: GetTournamentsDto) {
        return this.tournamentService.getMany({ status, skip, limit });
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(Tournament),
        } as SchemaObject,
        description: 'Returns tournament by id',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    public getTournament(@Param(validationPipe) { id }: GetTournamentDto) {
        return this.tournamentService.getOne(id);
    }
}
