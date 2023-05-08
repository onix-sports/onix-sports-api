import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { organizationsConstants } from '../organizations.constants';
import { Organization } from './organizations.schema';

@Schema({
    versionKey: false,
    timestamps: true,
    collection: organizationsConstants.models.organizationDeleteLog,
})
export class OrganizationDeleteLog extends Organization {
    @Prop({ required: true, unique: false })
    title: string;
}

export type OrganizationDeleteLogEntity = OrganizationDeleteLog & Document;

export const OrganizationDeleteLogSchema = SchemaFactory.createForClass(OrganizationDeleteLog);
