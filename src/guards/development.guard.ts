import { CanActivate, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class DevelopmentGuard implements CanActivate {
    constructor(
    private configService: ConfigService,
    ) {}

    async canActivate(): Promise<boolean> {
        const isDev = this.configService.get<string>('NODE_ENV') === 'development';

        return isDev;
    }
}
