import { Document } from 'mongoose';

import { RolesEnum } from '@decorators/roles.decorator';
import usersConstants from '../user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TelegramData = { 
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  language_code: string;
  is_bot: boolean;
};

@Schema({
  versionKey: false,
  timestamps: true,
  collection: usersConstants.models.users,
})
export class User {
  @Prop({ type: String, required: true })
  name: string = '';

  @Prop({ type: String, required: true, unique: true })
  email: string = '';

  @Prop({ type: String, default: '' })
  password: string = '';

  @Prop({ type: Boolean, default: true })
  verified: boolean = true;

  @Prop({ type: RolesEnum, default: RolesEnum.user })
  role: RolesEnum = RolesEnum.user;

  @Prop({ default: usersConstants.defaultAvatar })
  avatarUrl: string;

  @Prop({ type: {} as TelegramData, default: {} })
  telegram: TelegramData;
};

export type UserEntity = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
