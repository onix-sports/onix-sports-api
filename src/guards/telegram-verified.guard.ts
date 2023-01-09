import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export default class TelegramVerifiedGuard implements CanActivate {
    constructor(
    private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { body: { hash, ...data } } = context.switchToHttp().getRequest();
        const secret = crypto.createHash('sha256')
            .update(this.configService.get<string>('TELEGRAM_API_KEY')!)
            .digest();
        const checkString = Object.keys(data)
            .sort()
            .filter((k) => data[k])
            .map((k) => (`${k}=${data[k]}`))
            .join('\n');
        const hmac = crypto.createHmac('sha256', secret)
            .update(checkString)
            .digest('hex');

        return hmac === hash;
    }
}
