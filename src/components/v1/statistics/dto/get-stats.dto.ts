import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsDefined } from 'class-validator';
import { ObjectId } from 'mongodb';

export class GetStatsDto {
    @ApiProperty({ isArray: true, type: String })
    @IsDefined()
    @Transform(({ value }) => value.map((id: string) => new ObjectId(id)))
    ids: ObjectId[];

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    dateFrom: Date;

    @ApiProperty({ type: Number })
    @IsDefined()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    dateTo: Date;
}
