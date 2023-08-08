import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SelectOrganizationDto {
    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    organization?: String;
}
