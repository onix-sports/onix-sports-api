import { Teams } from '@components/games/enum/teams.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export default class CreateStatsDto {
    @ApiProperty({ type: Number })
    readonly mGoals: number = 0;

    @ApiProperty({ type: Number })
    readonly rGoals: number = 0;

    @ApiProperty({ type: Boolean })
    readonly won: boolean = false;

    @ApiProperty({ type: String })
    readonly user: ObjectId = new ObjectId();

    @ApiProperty({ type: String })
    readonly game: ObjectId = new ObjectId();

    @ApiProperty({ type: String })
    readonly tournament: ObjectId = new ObjectId();

    @ApiProperty({ type: Teams })
    readonly team: Teams = Teams.red;

    @ApiProperty({ type: String })
    readonly teammate: ObjectId;

    @ApiProperty({ type: [String] })
    readonly enemy: ObjectId[];
}
