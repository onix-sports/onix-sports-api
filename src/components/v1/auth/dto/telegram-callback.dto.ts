import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
    IsDefined,
    IsNumber, IsOptional, IsString, IsUrl,
} from 'class-validator';

export default class TelegramCallbackDto {
    @ApiProperty({ type: Number, required: true })
    @IsNumber()
    @IsDefined()
    @Transform(({ value }) => Number(value))
    id: number;

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsDefined()
    @Expose({ name: 'first_name' })
    firstName: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    @Expose({ name: 'last_name' })
    lastName?: string;

    @ApiProperty({ type: String, required: true })
    @IsDefined()
    @IsString()
    username: string;

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsUrl()
    @IsDefined()
    @Expose({ name: 'photo_url' })
    photoUrl: string;

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsDefined()
    @Expose({ name: 'auth_date' })
    authDate: string;

    @ApiProperty({ type: String, required: true })
    @IsDefined()
    @IsString()
    hash: string;
}
