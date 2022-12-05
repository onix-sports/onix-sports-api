import { ObjectId } from 'mongodb';

export const toObjectId = ({ value }: any) => new ObjectId(value);
