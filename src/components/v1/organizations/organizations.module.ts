import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { organizationsConstants } from './organizations.constants';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { OrganizationsService } from './organizations.service';
import { OrganizationInviteSchema } from './schemas/organization-invite.schema';
import { OrganizationSchema } from './schemas/organizations.schema';
import { OrganizationInviteRepository } from './repositories/organization-invite.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: organizationsConstants.models.organizations,
                collection: organizationsConstants.models.organizations,
                schema: OrganizationSchema,
            },
            {
                name: organizationsConstants.models.organizationInvite,
                collection: organizationsConstants.models.organizationInvite,
                schema: OrganizationInviteSchema,
            },
        ]),
        UsersModule,
    ],
    controllers: [OrganizationsController],
    providers: [OrganizationsService, OrganizationsRepository, OrganizationInviteRepository],
    exports: [OrganizationsRepository],
})
export class OrganizationsModule {}
