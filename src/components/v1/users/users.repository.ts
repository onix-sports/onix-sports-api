import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import SignUpDto from '@components/v1/auth/dto/sign-up.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import userConstants from './user-constants';
import { TelegramData, UserEntity } from './schemas/user.schema';

@Injectable()
export default class UsersRepository {
    constructor(
    @InjectModel(userConstants.models.users)
    private readonly userModel: Model<UserEntity>,
    private readonly eventEmitter: EventEmitter2,
    ) {}

    async create(user: SignUpDto) {
        const _user = await this.userModel.create(user);

        await this.eventEmitter.emitAsync('user.created', _user);

        return _user;
    }

    async createFromTelegram(telegram: TelegramData) {
        const user = await this.userModel.create({
            name: telegram.first_name,
            email: `${telegram.first_name}@test.com`,
            telegram,
        });

        await this.eventEmitter.emitAsync('user.created', user);

        return user;
    }

    getAll(limit?: number, skip?: number) {
        return this.userModel.find({ verified: true }, { password: 0 }, { skip, limit });
    }

    getUser(id: ObjectId) {
        return this.userModel.findById(id, { password: 0 });
    }

    get(filter: FilterQuery<UserEntity>) {
        return this.userModel.find(filter, { password: 0 });
    }

    set(filter: FilterQuery<UserEntity>, $set: any) {
        return this.userModel.findOneAndUpdate(filter, { $set });
    }

    update(filter: FilterQuery<UserEntity>, update: UpdateQuery<UserEntity>) {
        return this.userModel.findOneAndUpdate(filter, update);
    }

    updateMany(filter: FilterQuery<UserEntity>, update: UpdateQuery<UserEntity>) {
        return this.userModel.updateMany(filter, update);
    }
}
