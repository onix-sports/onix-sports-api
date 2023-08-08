import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { UtilsService } from '@components/utils/utils.service';
import { ICreateOrganization } from '../interfaces/create-organization.interface';
import { organizationsConstants } from '../organizations.constants';
import { Organization, OrganizationEntity } from '../schemas/organizations.schema';

@Injectable()
export class OrganizationsRepository {
    constructor(
        @InjectModel(organizationsConstants.models.organizations)
        private readonly organizationsModel: Model<OrganizationEntity>,
        private readonly utilsService: UtilsService,
    ) {}

    create(organization: ICreateOrganization) {
        const inviteToken = this.utilsService.generateRandomString(organizationsConstants.invites.tokenLength);

        return this.organizationsModel.create({
            ...organization,
            inviteToken,
            tokenGeneratedAt: new Date(),
        });
    }

    updateFields(user: ObjectId, organization: ObjectId, update: Partial<Organization>) {
        return this.organizationsModel.findOneAndUpdate(
            { _id: organization, creatorId: user, deleted: false },
            { $set: update },
            { projection: { inviteToken: 0, tokenGeneratedAt: 0 }, new: true },
        );
    }

    deleteOrganization(creator: ObjectId, organization: ObjectId) {
        return this.organizationsModel.findOneAndUpdate(
            { _id: organization, creatorId: creator, deleted: false },
            { $set: { deleted: true } },
            { projection: { inviteToken: 0, tokenGeneratedAt: 0 } },
        );
    }

    getByPagination(pagination: { skip?: number; limit?: number } = {}) {
        return this.organizationsModel.find({ deleted: false }, { ...pagination, projection: { inviteToken: 0, tokenGeneratedAt: 0 } });
    }

    getMany(ids: ObjectId[]) {
        return this.organizationsModel.find({ _id: { $in: ids }, deleted: false }, { inviteToken: 0, tokenGeneratedAt: 0 });
    }

    getOrganizationByCreator(creator: ObjectId, organization: ObjectId) {
        return this.organizationsModel.findOne({ _id: organization, creatorId: creator, deleted: false }, { inviteToken: 0, tokenGeneratedAt: 0 });
    }

    getById(organization: ObjectId) {
        return this.organizationsModel.findOne({ _id: organization, deleted: false }, { inviteToken: 0, tokenGeneratedAt: 0 });
    }

    generateInviteToken(user: ObjectId, organization: ObjectId, inviteToken: string) {
        return this.organizationsModel.updateOne(
            { _id: organization, creatorId: user, deleted: false },
            { $set: { inviteToken, tokenGeneratedAt: new Date() } },
        );
    }

    getByToken(inviteToken: string) {
        return this.organizationsModel.findOne(
            {
                inviteToken,
                tokenGeneratedAt: { $gte: new Date(Date.now() - organizationsConstants.invites.tokenDuration) },
                deleted: false,
            },
        );
    }
}
