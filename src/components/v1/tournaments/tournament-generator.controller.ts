import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GenerateTournamentDto } from './dto/generate-tournament.dto';
import { TournamentGenerator } from './tournament-generator.service';

@ApiTags('Generate tournament')
@Controller('tournaments')
export class TournamentGeneratorController {
    constructor(
    private readonly tournamentGenerator: TournamentGenerator,
    ) {}

  @ApiBody({ type: GenerateTournamentDto })
  @Post('/generate')
    public generateTournament(@Body() { title, players }: GenerateTournamentDto) {
        return this.tournamentGenerator.generate(players, title);
    }
}
