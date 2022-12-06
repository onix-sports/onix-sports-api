import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDefined } from 'class-validator';
import { ObjectId } from 'mongodb';

export class GetFakeStatsDto {
    @ApiProperty({ isArray: true, type: String })
    @IsDefined()
    @IsArray()
    @Transform(({ value }) => value.map((id: string) => new ObjectId(id)))
    users: ObjectId[];
}
