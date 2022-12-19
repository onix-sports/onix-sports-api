import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

export const ApiDefaultNotFoundResponse = (message: string | string[]) => {
    return (target: any, propertyKey: string, descriptor: any) => {
        const path = Reflect.getMetadata('path', descriptor.value as object);

        return applyDecorators(
            ApiNotFoundResponse({
                schema: {
                    type: 'object',
                    properties: {
                        statusCode: {
                            type: 'number',
                        },
                        timestamp: {
                            type: 'string',
                        },
                        path: {
                            type: 'string',
                        },
                        message: {
                            type: 'string',
                        },
                    },
                    example: {
                        statusCode: 404,
                        timestamp: new Date().toISOString(),
                        path,
                        message: [message].flat().join(' | '),
                    },
                },
                description: '404. NotFoundException',
            }),
        )(target, propertyKey, descriptor);
    };
};
