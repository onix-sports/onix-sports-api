import { applyDecorators, SetMetadata } from '@nestjs/common';
import { TournamentType } from '@components/v1/tournaments/enum/tour-type.enum';
import { tournamentGeneratorConstants } from '../tournament-generator.constants';
import { TournamentSchema } from '../interfaces/tournament-schema.interface';

export const Tournament = (type: TournamentType, schema: TournamentSchema) => {
    return applyDecorators(
        SetMetadata(tournamentGeneratorConstants.metadata.tournamentType, type),
        SetMetadata(tournamentGeneratorConstants.metadata.tournamentSchema, schema),
    );
};
