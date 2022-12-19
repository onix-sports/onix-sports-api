import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseNumberPipe implements PipeTransform {
    transform(value: any) {
        return value && Number(value);
    }
}
