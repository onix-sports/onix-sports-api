import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import {
    Controller, Get, HttpCode, HttpStatus, Query, UseGuards,
} from '@nestjs/common';
import {
    ApiExtraModels, ApiTags, getSchemaPath,
} from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import RequestUser from '@decorators/request-user.decorator';
import JwtPayloadDto from '@components/v1/auth/dto/jwt-payload.dto';
import Authorized from '@decorators/authorized.decorator';
import OrganizationGuard from '@guards/organization.guard';
import SelectedOrganization from '@decorators/selected-organization.decorator';
import { ObjectId } from 'mongodb';
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
        description: 'Returns users by selected organization',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Get('/members')
    public getOrganizationsUsers(@Query(validationPipe) { skip, limit }: GetUsersDto, @SelectedOrganization() organization: ObjectId) {
        return this.usersService.getOrganizationUsers(organization, limit, skip);
    }
}
