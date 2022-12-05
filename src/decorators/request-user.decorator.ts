import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import JwtPayloadDto from '@components/auth/dto/jwt-payload.dto';

const RequestUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as JwtPayloadDto;
    },
);

export default RequestUser;
