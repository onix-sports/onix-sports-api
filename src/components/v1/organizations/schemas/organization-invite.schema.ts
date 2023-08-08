import userConstants from '@components/v1/users/user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { OrganizationInviteStatusEnum } from '../enums/organization-invite-status.enum';
import { organizationsConstants } from '../organizations.constants';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: organizationsConstants.models.organizationInvite,
})
export class OrganizationInvite {
    @Prop({ default: OrganizationInviteStatusEnum.PENDING })
    status: string;

    @Prop({ required: true, ref: organizationsConstants.models.organizations })
    organization: ObjectId;

    @Prop({ required: true, ref: userConstants.models.users })
    invitedUser: ObjectId;
}

export type OrganizationInviteEntity = OrganizationInvite & Document;

export const OrganizationInviteSchema = SchemaFactory.createForClass(OrganizationInvite);
