import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import {
    Controller, Get, HttpCode, HttpStatus, Param, Query,
} from '@nestjs/common';
import {
    ApiExtraModels, ApiTags, getSchemaPath,
} from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { GetUserDto } from './dto/get-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@ApiTags('Users')
@ApiExtraModels(User)
@Controller('users')
export class UsersController {
    constructor(
    private readonly usersService: UsersService,
    ) {}

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(User),
            },
        },
        description: 'Returns all users',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/')
    public async getAll(@Query(validationPipe) { skip, limit }: GetUsersDto) {
        return this.usersService.getAll(limit, skip);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(User),
        } as SchemaObject,
        description: 'Returns user by id',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    public getUser(@Param(validationPipe) { id }: GetUserDto) {
        return this.usersService.getUser(id);
    }
}
