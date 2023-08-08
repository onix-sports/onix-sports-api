import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import Authorized from '@decorators/authorized.decorator';
import RequestUser from '@decorators/request-user.decorator';
import OrganizationGuard from '@guards/organization.guard';
import {
    Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import validationPipe from '@pipes/validation.pipe';
import SelectedOrganization from '@decorators/selected-organization.decorator';
import { ObjectId } from 'mongodb';
import JwtPayloadDto from '../auth/dto/jwt-payload.dto';
import { CloseTournamentDto } from './dto/close-tournament.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { GetTournamentDto } from './dto/get-tournament.dto';
import { GetTournamentsDto } from './dto/get-tournaments.dto';
import { Tournament } from './schemas/tournament.schema';
import { TournamentService } from './tournament.service';
import { ModeratorDto } from './dto/moderator.dto';

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
    @UseGuards(OrganizationGuard)
    @Authorized()
    @HttpCode(HttpStatus.CREATED)
    @Post('/')
    public createTournament(
        @Body() tournament: CreateTournamentDto,
        @RequestUser() user: JwtPayloadDto,
        @SelectedOrganization() organization: ObjectId,
    ) {
        return this.tournamentService.create({ ...tournament, organization }, user._id);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(Tournament),
        } as SchemaObject,
        description: 'Closes a tournament',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Tournament not found!')
    @HttpCode(HttpStatus.OK)
    @Authorized()
    @Patch('/close')
    public closeTournament(@Body() { id }: CloseTournamentDto, @RequestUser() user: JwtPayloadDto) {
        return this.tournamentService.closeTournament(id, user._id);
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
    @UseGuards(OrganizationGuard)
    @Authorized()
    @HttpCode(HttpStatus.OK)
    @Get('/')
    public getTournaments(@Query(validationPipe) dto: GetTournamentsDto, @SelectedOrganization() organization: ObjectId) {
        return this.tournamentService.getMany({ ...dto, organization });
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(Tournament),
        } as SchemaObject,
        description: 'Returns tournament by id',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Tournament not found!')
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    public getTournament(@Param(validationPipe) { id }: GetTournamentDto, @RequestUser() user: JwtPayloadDto) {
        return this.tournamentService.getTournamentsByOrganizations([id], user.organizations);
    }

    @ApiResponse({
        description: 'Updates tournament moderator',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Tournament not found!')
    @Authorized()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Patch('/moderator')
    public shareAccessToTournament(@Body() body: ModeratorDto, @RequestUser() user: JwtPayloadDto) {
        return this.tournamentService.changeModerator(body.tournament, user._id, body.moderator);
    }
}
