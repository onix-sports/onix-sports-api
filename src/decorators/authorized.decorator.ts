import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import JwtAccessGuard from '@guards/jwt-access.guard';
import RolesGuard from '@guards/roles.guard';
import { RolesEnum } from '@decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import dotenv from 'dotenv';

dotenv.config();

export default function Authorized(...roles: RolesEnum[]) {
    const disabled = process.env.DISABLE_AUTH === 'true';

    if (disabled) {
        return () => {};
    }

    return applyDecorators(
        SetMetadata('__authorized__', true),
        SetMetadata('roles', roles),
        UseGuards(JwtAccessGuard, RolesGuard),
        ApiBearerAuth(),
    );
}
