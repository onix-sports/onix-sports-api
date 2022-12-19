import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

export const ApiDefaultBadRequestResponse = () => {
    return (target: any, propertyKey: string, descriptor: any) => {
        const path = Reflect.getMetadata('path', descriptor.value as object);

        return applyDecorators(
            ApiBadRequestResponse({
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
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                    example: {
                        statusCode: 400,
                        timestamp: new Date().toISOString(),
                        path,
                        message: [
                            'id should not be null or undefined',
                            'id must be a number conforming to the specified constraints',
                            'firstName should not be null or undefined',
                            'firstName must be a string',
                            'username should not be null or undefined',
                            'username must be a string',
                        ],
                    },
                },
                description: '400. ValidationException',
            }),
        )(target, propertyKey, descriptor);
    };
};
