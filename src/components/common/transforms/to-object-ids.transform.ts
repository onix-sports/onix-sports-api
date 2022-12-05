import { ObjectId } from 'mongodb';

export const toObjectIds = ({ value }: any) => value.map((val: any) => new ObjectId(val));
