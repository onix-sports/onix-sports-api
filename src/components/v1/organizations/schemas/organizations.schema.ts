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
    @Prop({ required: true, unique: true })
    title: string;

    @Prop({ default: '' })
    image: string;

    @Prop({ ref: userConstants.models.users, required: true })
    creatorId: ObjectId;
}

export type OrganizationEntity = Organization & Document;

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
