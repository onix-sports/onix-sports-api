import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import AUTH_CONSTANTS from '../auth.constants';
import JwtPayloadDto from '../dto/jwt-payload.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class JwtWSAccessStrategy extends PassportStrategy(
  Strategy,
  'accessTokenWS',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (client: any) => {
          const bearerToken = client?.handshake?.headers?.authorization;

          return bearerToken ? bearerToken.split(' ')[1] : null;
        },
      ]),
      ignoreExpiration: true,
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
