import { UsersModule } from '@components/v1/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import authConstants from './auth.constants';
import { AuthController } from './auth.controller';
import AuthRepository from './auth.repository';
import { AuthService } from './auth.service';
import JwtAccessStrategy from './strategies/jwt-access.strategy';

@Module({
    imports: [
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
