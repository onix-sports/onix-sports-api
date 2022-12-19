import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiResponse as ApiNestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const ApiResponse = ({ properties, schema, ...options }: { properties?: SchemaObject, schema?: SchemaObject, description: string }) => {
    return (target: any, propertyKey: string, descriptor: any) => {
        if (!descriptor) return;

        const routeOptions = {
            status: Reflect.getMetadata('__httpCode__', descriptor.value as object),
            path: Reflect.getMetadata('path', descriptor.value as object),
            authorized: Reflect.getMetadata('__authorized__', descriptor.value as object),
        };

        const decorator = applyDecorators(
            ApiNestResponse({
                status: routeOptions.status,
                schema: {
                    type: 'object',
                    properties: {
                        data: properties || { type: 'object' },
                    },
                    ...schema,
                },
                ...options,
            }),
            ApiInternalServerErrorResponse({
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
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        timestamp: new Date().toISOString(),
                        path: routeOptions.path,
                        message: 'Some server error',
                    },
                },
                description: '500. InternalServerError',
            }),
            routeOptions.authorized ? ApiUnauthorizedResponse({
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
                        statusCode: HttpStatus.UNAUTHORIZED,
                        timestamp: new Date().toISOString(),
                        path: routeOptions.path,
                        message: 'Unauthorized',
                    },
                },
                description: '401. UnauthorizedException',
            }) : () => {},
        );

        // eslint-disable-next-line consistent-return
        return decorator(target, propertyKey, descriptor);
    };
};
