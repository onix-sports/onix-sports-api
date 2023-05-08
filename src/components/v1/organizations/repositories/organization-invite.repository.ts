import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';
import { organizationsConstants } from '../organizations.constants';
import { OrganizationInviteEntity } from '../schemas/organization-invite.schema';

@Injectable()
export class OrganizationInviteRepository {
    constructor(
        @InjectModel(organizationsConstants.models.organizationInvite)
        private readonly organizationsInviteModel: Model<OrganizationInviteEntity>,
    ) {}

    create(user: ObjectId, organization: ObjectId) {
        return this.organizationsInviteModel.create({
            invitedUser: user,
            organization,
        });
    }

    findOne(query: FilterQuery<OrganizationInviteEntity>) {
        return this.organizationsInviteModel.findOne(query);
    }

    findOneAndUpdate(query: FilterQuery<OrganizationInviteEntity>, update: Partial<OrganizationInviteEntity>) {
        return this.organizationsInviteModel.findOneAndUpdate(query, update);
    }

    find(query: FilterQuery<OrganizationInviteEntity>) {
        return this.organizationsInviteModel.find(query);
    }
}
