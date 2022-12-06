import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { ObjectId } from 'mongodb';

export class GetUserDto {
    @ApiProperty({ type: String })
    @IsDefined()
    @Transform(({ value }) => new ObjectId(value))
    id: ObjectId;
}
