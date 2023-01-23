import { ValidationPipe } from '@nestjs/common';

export default new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidNonWhitelisted: true,
});
