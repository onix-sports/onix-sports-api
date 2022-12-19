import { ObjectId } from 'mongodb';

export const toObjectIds = ({ value }: any) => [value].flat().map((value) => new ObjectId(value));
