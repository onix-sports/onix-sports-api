import {
    BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import { UtilsService } from '@components/utils/utils.service';
import UsersRepository from '../users/users.repository';
import { ICreateOrganization } from './interfaces/create-organization.interface';
import { OrganizationInviteRepository } from './repositories/organization-invite.repository';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { Organization } from './schemas/organizations.schema';
import { organizationsConstants } from './organizations.constants';

@Injectable()
export class OrganizationsService {
    constructor(
        private readonly organizationsRepository: OrganizationsRepository,
        private readonly organizationInviteRepository: OrganizationInviteRepository,
        private readonly usersRepository: UsersRepository,
        private readonly eventEmmiter: EventEmitter2,
        private readonly utilsService: UtilsService,
    ) {}

    // @TODO: Need to update access token
    async create(organization: ICreateOrganization) {
        const _organization = await this.organizationsRepository.create(organization);

        await this.usersRepository.addOrganization(organization.creatorId, _organization._id);

        return _organization.toObject();
    }

    async delete(creator: ObjectId, organization: ObjectId) {
        const result = await this.organizationsRepository.deleteOrganization(creator, organization);

        if (!result) {
            throw new NotFoundException('Organization not found!');
        }

        await this.usersRepository.removeOrganizationFromAllUsers(organization);
    }

    getByPagination(pagination: { skip?: number; limit?: number } = {}) {
        return this.organizationsRepository.getByPagination(pagination);
    }

    findOrgnaizationByIds(ids: ObjectId[]) {
        return this.organizationsRepository.getMany(ids);
    }

    async inviteToOrganization(creator: ObjectId, user: ObjectId, organization: ObjectId) {
        const organizationFound = await this.organizationsRepository.getOrganizationByCreator(creator, organization);

        if (!organizationFound) {
            throw new NotFoundException('Organization not found!');
        }

        const userFound = await this.usersRepository.getUser(user);

        if (!userFound) {
            throw new NotFoundException('User not found!');
        }

        const alreadyInOrganization = userFound.organizations.map((org) => org.toString()).includes(organization.toString());

        if (alreadyInOrganization) {
            throw new BadRequestException('User is already in organization!');
        }

        const invite = await this.organizationInviteRepository.create(user, organization);

        this.eventEmmiter.emit('organization.invite', invite);

        return invite;
    }

    async acceptInvite(user: ObjectId, invite: ObjectId) {
        const invitation = await this.organizationInviteRepository.acceptInvite(user, invite);

        if (!invitation) {
            throw new NotFoundException('Invitation not found or was rejected or accepted!');
        }

        await this.usersRepository.addOrganization(user, invitation.organization);
    }

    async declineInvite(user: ObjectId, invite: ObjectId) {
        const invitation = await this.organizationInviteRepository.declineInvite(user, invite);

        if (!invitation) {
            throw new NotFoundException('Invitation not found or was rejected or accepted!');
        }
    }

    getMyInvites(user: ObjectId) {
        return this.organizationInviteRepository.getUserInvites(user);
    }

    // @TODO: Need to update access token
    async kickFromOrganization(creator: ObjectId, user: ObjectId, organization: ObjectId) {
        if (creator.toString() === user.toString()) {
            throw new BadRequestException('You cannot kick yourself from organization!');
        }

        const organizationFound = await this.organizationsRepository.getOrganizationByCreator(creator, organization);

        if (!organizationFound) {
            throw new NotFoundException('Organization not found!');
        }

        await this.usersRepository.removeOrganization(user, organization);
    }

    async leaveFromOrganization(user: ObjectId, organization: ObjectId) {
        const foundOrganization = await this.organizationsRepository.getById(organization);

        if (!foundOrganization) {
            throw new NotFoundException('Organization not found!');
        }

        if (foundOrganization.creatorId.toString() === user.toString()) {
            throw new BadRequestException('You cannot leave from your organization!');
        }

        const result = await this.usersRepository.removeOrganization(user, organization);

        if (!result) {
            throw new NotFoundException('User not found!');
        }
    }

    async update(user: ObjectId, organization: ObjectId, update: Partial<Organization>) {
        const updatedOrganization = await this.organizationsRepository.updateFields(user, organization, update);

        if (!updatedOrganization) {
            throw new NotFoundException('Organization not found!');
        }

        return updatedOrganization;
    }

    async generateInviteToken(user: ObjectId, organization: ObjectId) {
        const token = this.utilsService.generateRandomString(organizationsConstants.invites.tokenLength);
        const updatedOrganization = await this.organizationsRepository.generateInviteToken(user, organization, token);

        if (!updatedOrganization.matchedCount) {
            throw new NotFoundException('Organization not found!');
        }

        return token;
    }

    async joinOrganization(user: ObjectId, token: string) {
        const organization = await this.organizationsRepository.getByToken(token);

        if (!organization) {
            throw new BadRequestException('Invalid token!');
        }

        await this.usersRepository.addOrganization(user, organization._id);

        return organization.toJSON();
    }
}
