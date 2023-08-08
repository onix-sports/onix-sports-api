import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDefined,
    IsOptional, IsString, MaxLength, MinLength,
} from 'class-validator';

export class CreateOrganizationDto {
    @ApiProperty({ type: String, description: 'Organization title' })
    @IsDefined()
    @IsString()
    @MinLength(1)
    @MaxLength(80)
    title: string;

    @ApiPropertyOptional({ type: String, description: 'Organization image' })
    @IsOptional()
    @IsString()
    image?: string = '';
}
