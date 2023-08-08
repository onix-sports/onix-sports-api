import { ApiProperty } from '@nestjs/swagger';
import {
    IsDefined, IsString, MaxLength, MinLength,
} from 'class-validator';
import { organizationsConstants } from '../organizations.constants';

export class JoinDto {
    @ApiProperty({ type: String })
    @IsDefined()
    @IsString()
    @MinLength(organizationsConstants.invites.tokenLength)
    @MaxLength(organizationsConstants.invites.tokenLength)
    token: string;
}
