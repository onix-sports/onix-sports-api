import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateChatDto } from "./dto/create-chat.dto";
import { notificationConstants } from "./notification.constants";
import { ChatDocument } from "./schemas/chat.schema";

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(notificationConstants.models.chats)
    private readonly chatModel: Model<ChatDocument>
  ) {}

  create(chat: CreateChatDto) {
    return this.chatModel.create(chat, () => {});
  }

  subscribe(chatId: Number) {
    return this.chatModel.updateOne({ chatId }, { subscribed: true });
  }

  unsubscribe(chatId: Number) {
    return this.chatModel.updateOne({ chatId }, { subscribed: false });
  }

  getAll() {
    return this.chatModel.find();
  }

  getSubscribers() {
    return this.chatModel.find({ subscribed: true });
  }

  getMain() {
    return this.chatModel.findOne({ subscribed: true, main: true });
  }
}