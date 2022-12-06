import {
    Body, Controller, Get, Param, Patch, Post, Query,
} from '@nestjs/common';
import {
    ApiBody, ApiParam, ApiQuery, ApiTags,
} from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { CloseTournamentDto } from './dto/close-tournament.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { GetTournamentDto } from './dto/get-tournament.dto';
import { GetTournamentsDto } from './dto/get-tournaments.dto';
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
    public closeTournament(@Body() { id }: CloseTournamentDto) {
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
    public getTournaments(@Query(validationPipe) { status, skip, limit }: GetTournamentsDto) {
        return this.tournamentService.getMany({ status, skip, limit });
    }

    @ApiParam({
        name: 'id',
        type: String,
    })
    @Get('/:id')
    public getTournament(@Param(validationPipe) { id }: GetTournamentDto) {
        return this.tournamentService.getOne(id);
    }
}
