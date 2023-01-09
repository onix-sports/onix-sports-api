import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export default class DebugResponseInterceptor implements NestInterceptor {
    private logger: Logger = new Logger(DebugResponseInterceptor.name);

    constructor(
        private readonly reflector: Reflector,
        private readonly configService: ConfigService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const isOnlyForDev = this.reflector.get<boolean>('__DEBUG_ONLY_DEV__', context.getHandler()) ?? false;
        const path = this.reflector.get<string>('path', context.getHandler());

        return next
            .handle()
            .pipe(
                tap((...args: any[]) => {
                    if (isOnlyForDev && this.configService.get<string>('NODE_ENV')! !== 'development') return;

                    this.logger.log(`${path} Response: ${JSON.stringify(args[0])}`);
                }),
            );
    }
}
