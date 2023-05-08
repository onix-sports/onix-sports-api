import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ObjectId } from 'mongodb';
import UsersRepository from '../users/users.repository';
import { OrganizationInviteStatusEnum } from './enums/organization-invite-status.enum';
import { ICreateOrganization } from './interfaces/create-organization.interface';
import { OrganizationDeleteLogRepository } from './repositories/organization-delete-log.repository';
import { OrganizationInviteRepository } from './repositories/organization-invite.repository';
import { OrganizationsRepository } from './repositories/organizations.repository';

@Injectable()
export class OrganizationsService {
    constructor(
        private readonly organizationsRepository: OrganizationsRepository,
        private readonly organizationInviteRepository: OrganizationInviteRepository,
        private readonly organizationDeleteLogRepository: OrganizationDeleteLogRepository,
        private readonly usersRepository: UsersRepository,
        private readonly eventEmmiter: EventEmitter2,
    ) {}

    // @TODO: Need to update access token
    async create(organization: ICreateOrganization) {
        const _organization = await this.organizationsRepository.create(organization).catch((error) => {
            if (error.code === 11000) {
                throw new BadRequestException(`Organization '${organization.title}' already exists!`);
            }

            throw new InternalServerErrorException('Something went wrong!');
        });

        await this.usersRepository.update({ _id: organization.creatorId }, { $push: { organizations: _organization._id } });

        return _organization;
    }

    async delete(creator: ObjectId, organization: ObjectId) {
        const result = await this.organizationsRepository.deleteOne({ creatorId: creator, _id: organization });

        if (!result) {
            throw new NotFoundException('Organization not found!');
        }

        await Promise.all([
            this.usersRepository.updateMany({ organizations: organization }, { $pull: { organizations: organization } }),
            this.organizationDeleteLogRepository.create({
                creatorId: result.creatorId,
                image: result.image,
                title: result.title,
            }),
        ]);
    }

    find(pagination: { skip?: number; limit?: number } = {}) {
        return this.organizationsRepository.find({}, pagination);
    }

    findOrgnaizationByIds(ids: ObjectId[]) {
        return this.organizationsRepository.find({ _id: { $in: ids } });
    }

    async inviteToOrganization(creator: ObjectId, user: ObjectId, organization: ObjectId) {
        const organizationFound = await this.organizationsRepository.findOne({ _id: organization, creatorId: creator });

        if (!organizationFound) {
            throw new NotFoundException('Organization not found!');
        }

        const invite = await this.organizationInviteRepository.create(user, organization);

        this.eventEmmiter.emit('organization.invite', invite);

        return invite;
    }

    async acceptInvite(user: ObjectId, invite: ObjectId) {
        const invitation = await this.organizationInviteRepository.findOneAndUpdate(
            {
                _id: invite,
                invitedUser: user,
                status: OrganizationInviteStatusEnum.PENDING,
            },
            {
                status: OrganizationInviteStatusEnum.ACCEPTED,
            },
        );

        if (!invitation) {
            throw new NotFoundException('Invitation not found or was rejected or accepted!');
        }

        await this.usersRepository.update({ _id: user }, { $push: { organizations: invitation.organization } });
    }

    getMyInvites(user: ObjectId) {
        return this.organizationInviteRepository.find({ invitedUser: user, status: OrganizationInviteStatusEnum.PENDING });
    }

    // @TODO: Need to update access token
    async kickFromOrganization(creator: ObjectId, user: ObjectId, organization: ObjectId) {
        if (creator.toString() === user.toString()) {
            throw new BadRequestException('You cannot kick yourself from organization!');
        }

        const organizationFound = await this.organizationsRepository.findOne({ _id: organization, creatorId: creator });

        if (!organizationFound) {
            throw new NotFoundException('Organization not found!');
        }

        await this.usersRepository.update({ _id: user }, { $pull: { organizations: organization } });
    }

    async leaveFromOrganization(user: ObjectId, organization: ObjectId) {
        const foundOrganization = await this.organizationsRepository.findOne({ _id: organization });

        if (!foundOrganization) {
            throw new NotFoundException('Organization not found!');
        }

        if (foundOrganization.creatorId.toString() === user.toString()) {
            throw new BadRequestException('You cannot leave from your organization!');
        }

        const result = await this.usersRepository.update({ _id: user }, { $pull: { organizations: organization } });

        if (!result) {
            throw new NotFoundException('User not found!');
        }
    }
}
