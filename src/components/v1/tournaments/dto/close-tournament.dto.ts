import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CloseTournamentDto {
    @ApiProperty({ type: String })
    @IsDefined()
    @Type(() => String)
    @Transform(({ value }) => new ObjectId(value))
    id: ObjectId;
}
