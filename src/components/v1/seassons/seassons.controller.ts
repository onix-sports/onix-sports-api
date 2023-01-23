import { ApiResponse } from '@decorators/api-response.decorator';
import {
    Controller, Get, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { LeaderboardEntity } from '@components/v1/common/dto/leaderboard-entity.interface';
import { SeassonsService } from './seassons.service';

@ApiTags('Seasons')
@ApiExtraModels(LeaderboardEntity)
@Controller('seasons')
export class SeassonsController {
    constructor(
        public readonly seassonsService: SeassonsService,
    ) {}

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    dateFrom: {
                        type: 'string',
                    },
                    dateTo: {
                        type: 'string',
                    },
                    number: {
                        type: 'number',
                    },
                    maxScore: {
                        type: 'number',
                    },
                    isWeak: {
                        type: 'boolean',
                        nullable: true,
                    },
                    players: {
                        type: 'array',
                        items: {
                            type: 'object',
                            $ref: getSchemaPath(LeaderboardEntity),
                        },
                    },
                },
            },
        },
        description: 'Returns all seasons',
    })
    @HttpCode(HttpStatus.OK)
    @Get()
    public getSeassons() {
        return this.seassonsService.getSeassons();
    }
}
