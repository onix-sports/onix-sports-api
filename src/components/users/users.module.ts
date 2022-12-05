import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import userConstants from './user-constants';
import { UserSchema } from './schemas/user.schema';
import UsersRepository from './users.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: userConstants.models.users,
                collection: userConstants.models.users,
                schema: UserSchema,
            },
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService, UsersRepository],
})
export class UsersModule {}
