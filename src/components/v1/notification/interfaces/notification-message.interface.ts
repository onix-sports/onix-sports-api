import { Context, NarrowedContext, Telegraf } from 'telegraf';
import * as tt from 'telegraf/src/telegram-types';
import { Update } from 'typegram';

export type MatchedContext<
  C extends Context,
  T extends tt.UpdateType | tt.MessageSubType
> = NarrowedContext<C, tt.MountMap[T]>

export interface NotificationMessage<MessageType extends 'message' | 'poll_answer' | 'text'> {
  bot: Telegraf<Context<Update>>,
  ctx: MatchedContext<Context<Update>, MessageType>
}
