import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import authConstants from "../auth.constants";

@Schema({
    versionKey: false,
    timestamps: true,
    collection: authConstants.models.auth.name,
})
export class Auth {
    @Prop({ type: String, required: true })
    refreshToken: string = '';

    @Prop({ type: Number, required: true, unique: true })
    id: number = 0;
}

export type AuthEntity = Auth & Document;

export const AuthSchema = SchemaFactory.createForClass(Auth);