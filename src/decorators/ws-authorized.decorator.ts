import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import RolesGuard from '@guards/roles.guard';
import { RolesEnum } from '@decorators/roles.decorator';
import { WsJwtAccessGuard } from '@guards/ws-jwt-access.guard';

export default function WsAuthorized(...roles: RolesEnum[]) {
    return applyDecorators(
        SetMetadata('__authorized__', true),
        SetMetadata('roles', roles),
        UseGuards(WsJwtAccessGuard, RolesGuard),
    );
}
