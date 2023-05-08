import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional, IsString, IsUrl, MaxLength, MinLength,
} from 'class-validator';

export class CreateOrganizationDto {
    @ApiProperty({ type: String, description: 'Organization title' })
    @IsString()
    @MinLength(1)
    @MaxLength(80)
    title: string;

    @ApiPropertyOptional({ type: String, description: 'Organization image' })
    @IsOptional()
    @IsString()
    @IsUrl()
    image: string = '';
}
