import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { OrganizationInviteStatusEnum } from '../enums/organization-invite-status.enum';
import { organizationsConstants } from '../organizations.constants';
import { OrganizationInviteEntity } from '../schemas/organization-invite.schema';

@Injectable()
export class OrganizationInviteRepository {
    constructor(
        @InjectModel(organizationsConstants.models.organizationInvite)
        private readonly organizationsInviteModel: Model<OrganizationInviteEntity>,
    ) {}

    create(user: ObjectId, organization: ObjectId) {
        return this.organizationsInviteModel.findOneAndUpdate(
            {
                status: OrganizationInviteStatusEnum.PENDING,
                invitedUser: user,
                organization,
            },
            {
                invitedUser: user,
                organization,
            },
            {
                upsert: true,
                new: true,
            },
        );
    }

    acceptInvite(user: ObjectId, invite: ObjectId) {
        return this.organizationsInviteModel.findOneAndUpdate(
            {
                _id: invite,
                invitedUser: user,
                status: OrganizationInviteStatusEnum.PENDING,
            },
            {
                status: OrganizationInviteStatusEnum.ACCEPTED,
            },
        );
    }

    declineInvite(user: ObjectId, invite: ObjectId) {
        return this.organizationsInviteModel.findOneAndUpdate(
            {
                _id: invite,
                invitedUser: user,
                status: OrganizationInviteStatusEnum.PENDING,
            },
            {
                status: OrganizationInviteStatusEnum.DECLINED,
            },
        );
    }

    getUserInvites(user: ObjectId) {
        return this.organizationsInviteModel
            .find({ invitedUser: user, status: OrganizationInviteStatusEnum.PENDING })
            .populate('organization', { title: 1, _id: 1 });
    }
}
