import {
    Controller, Get, Param, Query,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { GetUserDto } from './dto/get-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
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
    public async getAll(@Query(validationPipe) { skip, limit }: GetUsersDto) {
        return this.usersService.getAll(limit, skip);
    }

    @ApiParam({ name: 'id', type: String })
    @Get('/:id')
    public getUser(@Param(validationPipe) { id }: GetUserDto) {
        return this.usersService.getUser(id);
    }
}
