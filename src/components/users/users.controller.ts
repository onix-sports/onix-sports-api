import {
    Controller, Get, Param, Query,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParseNumberPipe } from '@pipes/number.pipe';
import { ParseObjectIdPipe } from '@pipes/objectId.pipe';
import { ObjectId } from 'mongodb';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
    private readonly usersService: UsersService,
    ) {}

    @ApiQuery({
        name: 'limit',
        required: false,
    })
    @ApiQuery({
        name: 'skip',
        required: false,
    })
    @Get('/')
    public async getAll(
    @Query('limit', ParseNumberPipe) limit: number,
    @Query('skip', ParseNumberPipe) skip: number,
    ) {
        return this.usersService.getAll(limit, skip);
    }

    @ApiParam({ name: 'id', type: String })
    @Get('/:id')
    public getUser(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    ) {
        return this.usersService.getUser(id);
    }
}
