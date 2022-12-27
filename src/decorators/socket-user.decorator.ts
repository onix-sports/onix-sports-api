import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { UserEntity } from '@components/users/schemas/user.schema';

const SocketUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();

    return {
      ...client.user,
      _id: new ObjectId(client.user._id),
    } as UserEntity;
  },
);

export default SocketUser;
