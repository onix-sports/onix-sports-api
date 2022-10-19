import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserEntity } from './schemas/user.schema';
import UsersRepository from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  getAll(limit: number = 0, skip: number = 0) {
    return this.usersRepository.getAll(limit, skip);
  }

  getUser(id: ObjectId) {
    return this.usersRepository.getUser(id);
  }

  async updateTelegramData(telegramId: number, username: string | undefined, telegram: any): Promise<UserEntity> {
    const user = await this.usersRepository.set({
      $or: [
        { 'telegram.id': telegramId },
        { 'telegram.username': username },
      ]
    }, { telegram });

    if (!user) {
      return this.usersRepository.createFromTelegram(telegram);
    }

    return user;
  }

  updateAvatar(_id: ObjectId, avatarUrl: string) {
    return this.usersRepository.set({ _id }, { avatarUrl });
  }
}
