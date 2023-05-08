import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ICreateOrganization } from '../interfaces/create-organization.interface';
import { organizationsConstants } from '../organizations.constants';
import { OrganizationEntity } from '../schemas/organizations.schema';

@Injectable()
export class OrganizationsRepository {
    constructor(
        @InjectModel(organizationsConstants.models.organizations)
        private readonly organizationsModel: Model<OrganizationEntity>,
    ) {}

    create(organization: ICreateOrganization) {
        return this.organizationsModel.create(organization);
    }

    deleteOne(filter: FilterQuery<OrganizationEntity>) {
        return this.organizationsModel.findOneAndDelete(filter);
    }

    find(query: FilterQuery<OrganizationEntity>, pagination: { skip?: number; limit?: number } = {}) {
        return this.organizationsModel.find(query, {}, pagination);
    }

    findOne(query: FilterQuery<OrganizationEntity>) {
        return this.organizationsModel.findOne(query);
    }
}
