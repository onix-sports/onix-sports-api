import {
    Body, Controller, Get, HttpCode, HttpStatus, Patch,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import Authorized from '@decorators/authorized.decorator';
import { RolesEnum } from '@decorators/roles.decorator';
import FakeStatsDto from '../dto/set-fake-stats.dto';
import { FakeStatisticsService } from '../services/fake-statistics.service';
import { FakeStatistic } from '../schemas/fake-statistics.schema';

@ApiTags('Fake statistics')
@ApiExtraModels(FakeStatistic)
@Authorized(RolesEnum.admin)
@Controller('fake-statistics')
export class FakeStatisticsController {
    constructor(
    private readonly fakeStatisticsService: FakeStatisticsService,
    ) {}

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(FakeStatistic),
            },
        },
        description: 'Returns fake statistics',
    })
    @HttpCode(HttpStatus.OK)
    @Get('/')
    public getStats() {
        return this.fakeStatisticsService.getStats();
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(FakeStatistic),
        } as SchemaObject,
        description: 'Sets fake statistics for user',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Patch('/')
    public setStats(@Body() { user, ...fakeStatsDto }: FakeStatsDto) {
        return this.fakeStatisticsService.setStats(user, { ...fakeStatsDto });
    }
}
