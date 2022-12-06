import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsJWT, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({ type: String })
    @IsDefined()
    @IsString()
    @IsJWT()
    readonly refreshToken: string = '';
}
