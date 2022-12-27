import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export type SocketClient = any;
export const Client = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();

    if (!(client.user._id instanceof ObjectId)) {
      client.user._id = new ObjectId(client.user._id);
    }

    return client as SocketClient;
  },
);
