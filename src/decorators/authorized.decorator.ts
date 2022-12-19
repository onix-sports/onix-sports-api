import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import JwtAccessGuard from '@guards/jwt-access.guard';
import RolesGuard from '@guards/roles.guard';
import { RolesEnum } from '@decorators/roles.decorator';

export default function Authorized(...roles: RolesEnum[]) {
    return applyDecorators(
        SetMetadata('__authorized__', true),
        SetMetadata('roles', roles),
        UseGuards(JwtAccessGuard, RolesGuard),
    );
}
