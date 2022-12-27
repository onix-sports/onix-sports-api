import { IsNumber, IsOptional } from 'class-validator';

export class WsPaginationDto {
  @IsNumber()
  @IsOptional()
  readonly skip: number = 0;

  @IsNumber()
  @IsOptional()
  readonly limit: number = 10;
}
