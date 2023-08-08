import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import Authorized from '@decorators/authorized.decorator';
import RequestUser from '@decorators/request-user.decorator';
import UpdateJwtResponseInterceptor from '@interceptors/update-jwt-response.interceptor';
import {
    Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Res, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Response } from 'express';
import validationPipe from '@pipes/validation.pipe';
import SelectedOrganization from '@decorators/selected-organization.decorator';
import { ObjectId } from 'mongodb';
import OrganizationGuard from '@guards/organization.guard';
import JwtPayloadDto from '../auth/dto/jwt-payload.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InviteToOrganizationDto } from './dto/invite-to-organization.dto';
import { KickFromOrganizationDto } from './dto/kick-from-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';
import { OrganizationInvite } from './schemas/organization-invite.schema';
import { Organization } from './schemas/organizations.schema';
import { SelectOrganizationDto } from './dto/select-organization.dto';
import { JoinDto } from './dto/join.dto';

@ApiTags('Organizations')
@ApiExtraModels(Organization)
@Controller('organizations')
export class OrganizationsController {
    constructor(
        private readonly organizationsService: OrganizationsService,
    ) {}

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(Organization),
        } as SchemaObject,
        description: 'Creates a organization.',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(new UpdateJwtResponseInterceptor())
    @Authorized()
    @Post()
    create(@Body() body: CreateOrganizationDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.create({ ...body, creatorId: user._id });
    }

    @ApiResponse({
        description: 'Deletes a organization.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Organization not found!')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Delete()
    delete(@RequestUser() user: JwtPayloadDto, @SelectedOrganization() organization: ObjectId) {
        return this.organizationsService.delete(user._id, organization);
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(Organization),
            },
        } as SchemaObject,
        description: 'Returns organizations.',
    })
    @HttpCode(HttpStatus.OK)
    @Get()
    find() {
        return this.organizationsService.getByPagination();
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(Organization),
            },
        } as SchemaObject,
        description: 'Returns user\'s organizations.',
    })
    @HttpCode(HttpStatus.OK)
    @Authorized()
    @Get('my')
    getMyOrganizations(@RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.findOrgnaizationByIds(user.organizations);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(OrganizationInvite),
        } as SchemaObject,
        description: 'Creates an invintation to organization. Only creator of organization allowed to invite users.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse([
        'Organization not found!',
        'User not found!',
    ])
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Put('invites')
    invite(
        @Body() body: InviteToOrganizationDto,
        @RequestUser() user: JwtPayloadDto,
        @SelectedOrganization() organization: ObjectId,
    ) {
        return this.organizationsService.inviteToOrganization(user._id, body.user, organization);
    }

    @ApiResponse({
        description: 'Accepts invitation to organization.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Invitation not found or was rejected or accepted!')
    @HttpCode(HttpStatus.OK)
    @Authorized()
    @UseInterceptors(new UpdateJwtResponseInterceptor())
    @Post('accept-invite')
    acceptInvite(@Body() body: AcceptInviteDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.acceptInvite(user._id, body.invitationId);
    }

    @ApiResponse({
        description: 'Declines invitation to organization.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Invitation not found or was rejected or accepted!')
    @HttpCode(HttpStatus.OK)
    @Authorized()
    @Post('decline-invite')
    declineInvite(@Body() body: AcceptInviteDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.declineInvite(user._id, body.invitationId);
    }

    @ApiResponse({
        properties: {
            type: 'array',
            items: {
                type: 'object',
                $ref: getSchemaPath(OrganizationInvite),
            },
        } as SchemaObject,
        description: 'Returns user\'s invitations.',
    })
    @HttpCode(HttpStatus.OK)
    @Authorized()
    @Get('invites')
    getMyInvites(@RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.getMyInvites(user._id);
    }

    @ApiResponse({
        description: 'Kick user from organization. Only creator of organization allowed to kick users.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Organization not found!')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Delete('kick')
    kick(
        @Body() body: KickFromOrganizationDto,
        @RequestUser() user: JwtPayloadDto,
        @SelectedOrganization() organization: ObjectId,
    ) {
        return this.organizationsService.kickFromOrganization(user._id, body.user, organization);
    }

    @ApiResponse({
        description: 'Leaves from organization.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Organization not found!')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Delete('leave')
    leave(@RequestUser() user: JwtPayloadDto, @SelectedOrganization() organization: ObjectId) {
        return this.organizationsService.leaveFromOrganization(user._id, organization);
    }

    @ApiResponse({
        properties: {
            type: 'object',
            $ref: getSchemaPath(Organization),
        } as SchemaObject,
        description: 'Updates a organization.',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Patch()
    update(
        @Body() update: UpdateOrganizationDto,
        @RequestUser() user: JwtPayloadDto,
        @SelectedOrganization() organization: ObjectId,
    ) {
        return this.organizationsService.update(user._id, organization, update);
    }

    @ApiResponse({
        description: 'Selects organization',
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorized()
    @Get('/:organization/select')
    select(@Res() res: Response, @Param(validationPipe) { organization }: SelectOrganizationDto, @RequestUser() user: JwtPayloadDto) {
        if (!organization) {
            return res
                .clearCookie('selectedOrganization')
                .status(HttpStatus.NO_CONTENT)
                .send();
        }

        if (!user.organizations.map((id) => id.toString()).includes(organization as string)) {
            throw new ForbiddenException('You are not a member of this organization!');
        }

        return res
            .cookie('selectedOrganization', organization)
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

    @ApiResponse({
        properties: {
            type: 'string',
        },
        description: 'Generates invite token',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Organization not found!')
    @HttpCode(HttpStatus.OK)
    @UseGuards(OrganizationGuard)
    @Authorized()
    @Patch('invite-token')
    generateInviteToken(@RequestUser() user: JwtPayloadDto, @SelectedOrganization() organization: ObjectId) {
        return this.organizationsService.generateInviteToken(user._id, organization);
    }

    @ApiResponse({
        description: 'Joins to organization via token.',
    })
    @ApiDefaultBadRequestResponse()
    @HttpCode(HttpStatus.OK)
    @Authorized()
    @UseInterceptors(new UpdateJwtResponseInterceptor())
    @Patch('join')
    join(@Body() { token }: JoinDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.joinOrganization(user._id, token);
    }
}
