import { ObjectId } from 'mongodb';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

export class ICreateOrganization extends CreateOrganizationDto {
    creatorId: ObjectId;
}
