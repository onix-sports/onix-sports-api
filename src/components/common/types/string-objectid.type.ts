import { ObjectId } from 'mongoose';
import { ObjectId as MongodbObjectId } from 'mongodb';

export type StringObjectId = ObjectId | string | String | MongodbObjectId;
