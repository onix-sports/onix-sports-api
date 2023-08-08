import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import {
    Body, Controller, HttpCode, HttpStatus, Post, UseGuards,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ObjectId } from 'mongodb';
import Authorized from '@decorators/authorized.decorator';
import OrganizationGuard from '@guards/organization.guard';
import RequestUser from '@decorators/request-user.decorator';
import SelectedOrganization from '@decorators/selected-organization.decorator';
import { GenerateTournamentDto } from './dto/generate-tournament.dto';
import { Tournament } from '../tournaments/schemas/tournament.schema';
import { TournamentGenerator } from './tournament-generator.service';
import JwtPayloadDto from '../auth/dto/jwt-payload.dto';

@ApiTags('Generate tournament')
@ApiExtraModels(Tournament)
@Controller('tournaments')
export class TournamentGeneratorController {
    constructor(
    private readonly tournamentGenerator: TournamentGenerator,
    ) {}

    @ApiResponse({
        properties: {
            type: 'object',
            properties: {
                games: {
                    type: 'array',
                },
                teams: {
                    type: 'array',
                },
                tournament: {
                    type: 'object',
                    $ref: getSchemaPath(Tournament),
                },
            },
        },
        description: 'Creates a tournament with games according to scheme. Scheme depends on number of players',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse(`Player with id ${new ObjectId()} was not found`)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @HttpCode(HttpStatus.CREATED)
    @Post('/generate')
    public generateTournament(
        @Body() { title, players }: GenerateTournamentDto,
        @RequestUser() user: JwtPayloadDto,
        @SelectedOrganization() organization: ObjectId,
    ) {
        return this.tournamentGenerator.generate(players, organization, user._id, title);
    }
}
