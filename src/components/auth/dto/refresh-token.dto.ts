import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsString } from "class-validator";

export class RefreshTokenDto {
    @ApiProperty({ type: String })
    @IsString()
    @IsJWT()
    readonly refreshToken: string = '';
}