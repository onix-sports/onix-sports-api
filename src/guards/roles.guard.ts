import _ from 'lodash';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesEnum } from '@decorators/roles.decorator';
import { UserEntity } from '@components/v1/users/schemas/user.schema';

@Injectable()
export default class RolesGuard implements CanActivate {
    constructor(
    private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<RolesEnum[]>('roles', context.getHandler()) || this.reflector.get<RolesEnum[]>('roles', context.getClass());

        if (_.isEmpty(roles)) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as UserEntity;

        return roles.includes(user.role);
    }
}
