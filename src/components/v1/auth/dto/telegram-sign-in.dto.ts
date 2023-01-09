import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export default class TelegramSignInDto {
    @ApiProperty()
    @IsString()
    @IsDefined()
    redirect: string;
}
