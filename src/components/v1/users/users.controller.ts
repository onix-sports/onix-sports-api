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
import RequestUser from '@decorators/request-user.decorator';
import JwtPayloadDto from '@components/v1/auth/dto/jwt-payload.dto';
import Authorized from '@decorators/authorized.decorator';
import { GetUserDto } from './dto/get-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@ApiTags('Users')
@ApiExtraModels(User, JwtPayloadDto)
@Controller('users')
export class UsersController {
    constructor(
    private readonly usersService: UsersService,
    ) {}

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(JwtPayloadDto),
        } as SchemaObject,
        description: 'Returns authenticated user',
    })
    @HttpCode(HttpStatus.OK)
    @Get('/me')
    @Authorized()
    public getMe(@RequestUser() user: JwtPayloadDto) {
        return user;
    }

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
