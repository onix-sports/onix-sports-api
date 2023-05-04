import { toObjectId } from '@components/v1/common/transforms/to-object-id.transform';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';
import { GameIdDto } from './start-game.dto';

export class GameEventDto extends GameIdDto {
    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Type(() => String)
    @Transform(toObjectId)
    readonly playerId: ObjectId;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Type(() => String)
    @Transform(toObjectId)
    readonly enemyId: ObjectId;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Type(() => String)
    @Transform(toObjectId)
    readonly actionId: ObjectId;
}
