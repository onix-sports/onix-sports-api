import userConstants from '@components/v1/users/user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { organizationsConstants } from '../organizations.constants';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: organizationsConstants.models.organizations,
})
export class Organization {
    @Prop({ required: true })
    title: string;

    @Prop({ default: '' })
    image: string;

    @Prop({ ref: userConstants.models.users, required: true })
    creatorId: ObjectId;

    @Prop({ minlength: organizationsConstants.invites.tokenLength, maxlength: organizationsConstants.invites.tokenLength })
    inviteToken: string;

    @Prop({ default: null })
    tokenGeneratedAt: Date;

    @Prop({ default: false })
    deleted: boolean;
}

export type OrganizationEntity = Organization & Document;

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
