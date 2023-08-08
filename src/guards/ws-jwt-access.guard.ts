import JwtPayloadDto from '@components/v1/auth/dto/jwt-payload.dto';
import { CanActivate, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import jsonwebtoken from 'jsonwebtoken';

@Injectable()
export class WsJwtAccessGuard implements CanActivate {
    constructor(
        private configService: ConfigService,
    ) {}

    async canActivate(
        context: any,
    ) {
        const bearerToken = context.args[0].handshake.auth?.token?.split?.(' ')?.[1] || '';

        try {
            const payload = jsonwebtoken.verify(bearerToken, this.configService.get<string>('ACCESS_TOKEN') as string) as JwtPayloadDto;

            context.args[0].user = payload;

            return true;
        } catch (ex) {
            throw new WsException('Unauthorized!');
        }
    }
}
