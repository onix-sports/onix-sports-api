import { Document, Schema, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import gameConstants from '../games-constants';
import statisticsConstants from '@components/statistics/statistics-constants';
import userConstants from '@components/users/user-constants';
import { GameStatus } from '../enum/game-status.enum';
import { Teams } from '../enum/teams.enum';
import { PlayersDto } from '../dto/players.dto';
import { TournamentConstants } from '@components/tournaments/tournament.constants';
import { StringObjectId } from '@components/common/types/string-objectid.type';

export class GameEntity extends Document {
  @ApiProperty({ type: String })
  readonly _id: Types.ObjectId = new ObjectId();

  @ApiProperty({ type: PlayersDto })
  readonly players: ObjectId[] = [new ObjectId()];

  readonly title: String = '';

  @ApiProperty({ type: String })
  readonly tournament: StringObjectId = '';
}

export const GameSchema = new Schema(
  {
    title: {
      type: String,
      default: '',
      required: true,
    },
    players: {
      type: [ObjectId],
      ref: userConstants.models.users,
      required: true,
    },
    stats: {
      type: [ObjectId],
      ref: statisticsConstants.models.statistics
    },
    winner: {
      type: Teams,
    },
    status: {
      type: GameStatus,
      default: GameStatus.DRAFT,
    },
    watchers: {
      type: [ObjectId],
      default: [],
    },
    actions: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    score: {
      type: [Number],
    },
    duration: {
      type: Number,
    },
    tournament: {
      type: ObjectId,
      ref: TournamentConstants.models.tournaments,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: gameConstants.models.games,
  },
);
