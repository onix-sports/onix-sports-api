import { UsersModule } from '@components/users/users.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import nest from '@nestjs/cli';
import authConstants from './auth.constants';
import { AuthController } from './auth.controller';
import AuthRepository from './auth.repository';
import { AuthService } from './auth.service';
import { AuthSchema } from './schemas/auth.schema';
import JwtAccessStrategy from './strategies/jwt-access.strategy';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: authConstants.models.auth.name,
                    schema: AuthSchema,
                    collection: authConstants.models.auth.name,
                },
            ],
        ),
        UsersModule,
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('ACCESS_TOKEN'),
                signOptions: { expiresIn: authConstants.jwt.expirationTime.accessToken },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository, JwtAccessStrategy],
})
export class AuthModule {}
