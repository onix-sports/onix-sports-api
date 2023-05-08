import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { organizationsConstants } from '../organizations.constants';
import { OrganizationDeleteLog, OrganizationDeleteLogEntity } from '../schemas/organization-delete-log.schema';

@Injectable()
export class OrganizationDeleteLogRepository {
    constructor(
        @InjectModel(organizationsConstants.models.organizationDeleteLog)
        private readonly organizationsInviteModel: Model<OrganizationDeleteLogEntity>,
    ) {}

    create(organization: OrganizationDeleteLog) {
        return this.organizationsInviteModel.create(organization);
    }
}
