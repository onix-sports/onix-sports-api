import DebugResponseInterceptor from '@interceptors/debug-response.interceptor';
import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

export default function DebugResponse(isForDev: boolean = false) {
    return applyDecorators(
        SetMetadata('__DEBUG_ONLY_DEV__', isForDev),
        UseInterceptors(DebugResponseInterceptor),
    );
}
