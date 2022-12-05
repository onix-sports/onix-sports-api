import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import authConstants from './auth.constants';
import { AuthEntity } from './schemas/auth.schema';

@Injectable()
export default class AuthRepository {
    constructor(
        @InjectModel(authConstants.models.auth.name)
        private readonly authModel: Model<AuthEntity>,
    ) {}

    public addRefreshToken(id: number, refreshToken: string) {
        return this.authModel.findOneAndReplace({ id }, { id, refreshToken }, { upsert: true });
    }

    public deleteRefreshToken(id: number) {
        return this.authModel.findOneAndDelete({ id });
    }

    public getRefreshToken(id: number) {
        return this.authModel.findOne({ id });
    }
}
