import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import {
    Body, Controller, HttpCode, HttpStatus, Post,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ObjectId } from 'mongodb';
import { GenerateTournamentDto } from './dto/generate-tournament.dto';
import { Tournament } from '../tournaments/schemas/tournament.schema';
import { TournamentGenerator } from './tournament-generator.service';

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
    @HttpCode(HttpStatus.CREATED)
    @Post('/generate')
    public generateTournament(@Body() { title, players }: GenerateTournamentDto) {
        return this.tournamentGenerator.generate(players, title);
    }
}
