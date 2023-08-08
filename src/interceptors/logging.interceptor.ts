import {
    Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger: Logger = new Logger(LoggingInterceptor.name);

    private reflector: Reflector = new Reflector();

    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
        const message = this.reflector.get<string>('message', ctx.getHandler());
        const timeBefore = Date.now();

        this.logger.log(`${ctx.getClass().name}.${ctx.getHandler().name} body: ${JSON.stringify(ctx.switchToHttp().getRequest().body)}`);

        return next
            .handle()
            .pipe(
                tap((data) => this.logger.log(
                    `${ctx.getClass().name}.${ctx.getHandler().name} ${message} ${Date.now() - timeBefore}ms body: ${JSON.stringify(data)}`,
                )),
            );
    }
}
