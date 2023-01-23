import TelegramCallbackDto from './telegram-callback.dto';

export default class UserCreateDto extends (TelegramCallbackDto as new () => Omit<TelegramCallbackDto, 'authDate' | 'hash'>) {}
