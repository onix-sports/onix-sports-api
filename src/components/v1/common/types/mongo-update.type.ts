import { UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

export type MongoUpdate<T> = UpdateWithAggregationPipeline | UpdateQuery<T>;
