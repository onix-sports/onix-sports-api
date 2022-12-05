import { GamesModule } from '@components/games/games.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { actionConstants } from './action.constants';
import { ActionRepository } from './action.repository';
import { ActionService } from './action.service';
import { ActionSchema } from './schemas/action.schema';

@Module({
    imports: [
        GamesModule,
        MongooseModule.forFeature([{
            name: actionConstants.models.action,
            collection: actionConstants.models.action,
            schema: ActionSchema,
        }]),
    ],
    providers: [ActionRepository, ActionService],
    exports: [ActionRepository, ActionService],
})
export class ActionModule {}
