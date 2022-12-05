import { Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameEventDto } from './dto/game-event.dto';
import { GameIdDto } from './dto/start-game.dto';
import { GameInfoDto } from './dto/game-info.dto';

@ApiTags('Games Sockets events')
@Controller('sockets')
export class GamesGatewayDoc {
  @ApiBody({ type: GameIdDto })
  @Post('start')
    start() {}

  @ApiBody({ type: GameEventDto })
  @Post('goal')
  goal() {}

  @ApiBody({ type: GameIdDto })
  @Post('pause')
  pause() {}

  @ApiBody({ type: GameEventDto })
  @Post('swap')
  swap() {}

  @ApiBody({ type: GameIdDto })
  @Post('data')
  data() {}

  @ApiResponse({ type: GameInfoDto, status: 200 })
  @Get('data')
  getData() {}

  @ApiResponse({ type: GameEventDto })
  @Get('cancel')
  cancel() {}
}
