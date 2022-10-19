import { Document } from 'mongoose';

import { RolesEnum } from '@decorators/roles.decorator';
import usersConstants from '../user-constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  @Prop({ type: String, required: true })
  password: string = '';

  @Prop({ type: Boolean, default: true })
  verified: boolean = true;

  @Prop({ type: RolesEnum, default: RolesEnum.user })
  role: RolesEnum = RolesEnum.user;

  @Prop({ default: usersConstants.defaultAvatar })
  avatarUrl: string;
};

export type UserEntity = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
