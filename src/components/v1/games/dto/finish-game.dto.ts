import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export default class FinishGameDto {
    @ApiProperty({ type: String })
    readonly id: ObjectId = new ObjectId();

    @ApiProperty({ type: [String] })
    readonly stats: [ObjectId] = [new ObjectId()];
}
