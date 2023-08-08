import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

@Injectable()
export default class UpdateJwtResponseInterceptor implements NestInterceptor {
    private reflector = new Reflector();

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((...args) => {
                return ({
                    ...args[0],
                    meta: {
                        ...(args[0]?.meta || {}),
                        auth: {
                            updateAccessToken: true,
                        },
                    },
                });
            }),
        );
    }
}
