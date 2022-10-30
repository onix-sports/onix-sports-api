import { Context, NarrowedContext, Telegraf} from "telegraf";
import * as tt from 'telegraf/src/telegram-types'
import { Update } from "typegram";

export interface NotificationMessage<MessageType extends "message" | "poll_answer"> {
  bot: Telegraf<Context<Update>>,
  ctx: MatchedContext<Context<Update>, MessageType>
}

type MatchedContext<
  C extends Context,
  T extends tt.UpdateType | tt.MessageSubType
> = NarrowedContext<C, tt.MountMap[T]>