import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export default class TelegramCallbackDto {
    @ApiProperty({ type: Number, required: true })
    @IsNumber()
    @Transform(({ value }) => Number(value))
    id: number;

    @ApiProperty({ type: String, required: true })
    @IsString()
    @Expose({ name: 'first_name' })
    firstName: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    @Expose({ name: 'last_name' })
    lastName?: string;

    @ApiProperty({ type: String, required: true })
    @IsOptional()
    @IsString()
    username: string;

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsUrl()
    @Expose({ name: 'photo_url' })
    photoUrl: string;

    @ApiProperty({ type: String, required: true })
    @IsString()
    @Expose({ name: 'auth_date' })
    authDate: string;

    @ApiProperty({ type: String, required: true })
    @IsString()
    hash: string;
}
