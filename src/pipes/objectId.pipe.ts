import { PipeTransform, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
    transform(value: any) {
        return value && new ObjectId(value.trim());
    }
}
