import UsersRepository from '@components/v1/users/users.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@components/v1/users/schemas/user.schema';
import JwtPayloadDto from './dto/jwt-payload.dto';
import UserCreateDto from './dto/user-create.dto';
import authConstants from './auth.constants';
import AuthRepository from './auth.repository';
import LoginDto from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly authRepository: AuthRepository,
    ) {}

    create(user: UserCreateDto) {
        return this.usersRepository.createFromTelegram({
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName || '',
            username: user.username,
            language_code: 'ua',
            is_bot: false,
        });
    }

    async refreshToken(token: string) {
        const payload: JwtPayloadDto | null = this.jwtService.decode(token) as JwtPayloadDto;

        if (!payload) {
            throw new ForbiddenException('Invalid token');
        }

        const oldToken = await this.authRepository.getRefreshToken(payload.telegram.id) || { refreshToken: '' };

        if (oldToken.refreshToken !== token) {
            throw new ForbiddenException('Invalid token');
        }

        return this.login(payload.telegram, false);
    }

    async login(telegram: LoginDto, refresh: boolean = true) {
        let user: UserEntity = await this.usersRepository.get({
            $or: [
                { 'telegram.id': telegram.id },
                { 'telegram.username': telegram.username },
            ],
        }) as any;

        if (!user) {
            user = await this.create(telegram);
        }

        if (Array.isArray(user)) {
            [user] = user;
        }

        const payload: JwtPayloadDto = {
            _id: user._id,
            role: user.role,
            telegram,
        };

        const accessToken = this.jwtService.sign(payload);

        if (refresh) {
            const refreshToken = this.jwtService.sign(payload, {
                expiresIn: authConstants.jwt.expirationTime.refreshToken,
                secret: this.configService.get<string>('REFRESH_TOKEN'),
            });

            await this.authRepository.addRefreshToken(telegram.id, refreshToken);

            return {
                accessToken,
                refreshToken,
            };
        }

        return {
            accessToken,
        };
    }

    async verifyToken(token: string) {
        const payload = await this.jwtService.verifyAsync<JwtPayloadDto>(token, {
            secret: this.configService.get<string>('ACCESS_TOKEN'),
        });

        return payload;
    }

    logout(id: number) {
        return this.authRepository.deleteRefreshToken(id);
    }
}
