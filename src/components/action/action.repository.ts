import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { actionConstants } from './action.constants';
import { CreateActionDto } from './dto/create-action.dto';
import { ActionDocument } from './schemas/action.schema';

@Injectable()
export class ActionRepository {
    constructor(
    @InjectModel(actionConstants.models.action)
    private readonly actionModel: Model<ActionDocument>,
    ) {}

    create(actions: CreateActionDto[]) {
        return this.actionModel.create(actions);
    }
}
