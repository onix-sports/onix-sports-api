import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
    transform(value: any) {
        return value && new Date(Number(value));
    }
}
