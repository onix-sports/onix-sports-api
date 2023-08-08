import JwtPayloadDto from '@components/v1/auth/dto/jwt-payload.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export default class OrganizationGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const {
            cookies,
            user: _user,
        } = context.switchToHttp().getRequest();
        const user = _user as JwtPayloadDto;

        if (!cookies.selectedOrganization) return false;

        return user
            .organizations
            .map((id) => id.toString())
            .includes(cookies.selectedOrganization);
    }
}
