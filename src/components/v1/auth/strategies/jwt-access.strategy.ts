import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongodb';
import JwtPayloadDto from '../dto/jwt-payload.dto';

@Injectable()
export default class JwtAccessStrategy extends PassportStrategy(Strategy, 'accessToken') {
    constructor(
    private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('ACCESS_TOKEN'),
        });
    }

    async validate(payload: JwtPayloadDto): Promise<any> {
        return {
            ...payload,
            _id: new ObjectId(payload._id),
        };
    }
}
