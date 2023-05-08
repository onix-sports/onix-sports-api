import { ApiDefaultBadRequestResponse } from '@decorators/api-default-bad-request-response.decorator';
import { ApiDefaultNotFoundResponse } from '@decorators/api-default-not-found-response.decorator';
import { ApiResponse } from '@decorators/api-response.decorator';
import Authorized from '@decorators/authorized.decorator';
import RequestUser from '@decorators/request-user.decorator';
import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Post,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import JwtPayloadDto from '../auth/dto/jwt-payload.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { DeleteOrganizationDto } from './dto/delete-organization.dto';
import { InviteToOrganizationDto } from './dto/invite-to-organization.dto';
import { KickFromOrganizationDto } from './dto/kick-from-organization.dto';
import { LeaveFromOrganizationDto } from './dto/leave-from-organization.dto';
import { OrganizationsService } from './organizations.service';
import { OrganizationInvite } from './schemas/organization-invite.schema';
import { Organization } from './schemas/organizations.schema';

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
    @Authorized()
    @Delete()
    delete(@Body() body: DeleteOrganizationDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.delete(user._id, body.organization);
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
        return this.organizationsService.find();
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
    @ApiDefaultNotFoundResponse('Organization not found!')
    @HttpCode(HttpStatus.CREATED)
    @Authorized()
    @Post('invites')
    invite(@Body() body: InviteToOrganizationDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.inviteToOrganization(user._id, body.user, body.organization);
    }

    @ApiResponse({
        description: 'Accepts invitation to organization.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Invitation not found or was rejected or accepted!')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorized()
    @Post('accept-invite')
    acceptInvite(@Body() body: AcceptInviteDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.acceptInvite(user._id, body.invitationId);
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
    @Authorized()
    @Delete('kick')
    kick(@Body() body: KickFromOrganizationDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.kickFromOrganization(user._id, body.user, body.organization);
    }

    @ApiResponse({
        description: 'Leaves from organization.',
    })
    @ApiDefaultBadRequestResponse()
    @ApiDefaultNotFoundResponse('Organization not found!')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorized()
    @Delete('leave')
    leave(@Body() body: LeaveFromOrganizationDto, @RequestUser() user: JwtPayloadDto) {
        return this.organizationsService.leaveFromOrganization(user._id, body.organization);
    }
}
