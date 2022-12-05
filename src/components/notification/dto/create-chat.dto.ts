import { ChatType } from '../enums/chat-type.enum';

export class CreateChatDto {
    chatId: Number;

    type: ChatType;
}
