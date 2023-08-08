import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ObjectId } from 'mongodb';

const SelectedOrganization = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => new ObjectId(ctx.switchToHttp().getRequest().cookies.selectedOrganization),
);

export default SelectedOrganization;
