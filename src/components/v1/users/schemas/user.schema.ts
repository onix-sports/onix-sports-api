import { Document } from 'mongoose';

import { RolesEnum } from '@decorators/roles.decorator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import usersConstants from '../user-constants';

export type TelegramData = {
  id: number;
  username: string;
  first_name: string;
  last_name: string | undefined;
  language_code?: string;
  is_bot: boolean;
};

@Schema({
    versionKey: false,
    timestamps: true,
    collection: usersConstants.models.users,
})
export class User {
    @ApiProperty()
    @Prop({ type: String, required: true })
    name: string = '';

    @ApiProperty()
    @Prop({ type: String, required: true, unique: true })
    email: string = '';

    @ApiProperty()
    @Prop({ type: String, default: '' })
    password: string = '';

    @ApiProperty()
    @Prop({ type: Boolean, default: true })
    verified: boolean = true;

    @ApiProperty()
    @Prop({ type: typeof RolesEnum, default: RolesEnum.user, enum: RolesEnum })
    role: RolesEnum = RolesEnum.user;

    @ApiProperty()
    @Prop({ default: usersConstants.defaultAvatar })
    avatarUrl: string;

    @ApiProperty()
    @Prop({ type: {} as TelegramData, default: {} })
    telegram: TelegramData;

    @ApiProperty()
    @Prop({ type: Array, default: [] })
    organizations: ObjectId[];
}

export type UserEntity = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
