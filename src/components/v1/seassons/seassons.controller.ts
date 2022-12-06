import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeassonsService } from './seassons.service';

@ApiTags('Seasons')
@Controller('seasons')
export class SeassonsController {
    constructor(
        public readonly seassonsService: SeassonsService,
    ) {}

    @Get()
    public getSeassons() {
        return this.seassonsService.getSeassons();
    }
}
