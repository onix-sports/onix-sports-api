import { AllExceptionsFilter } from '@filters/all-exception.filter';
import WrapResponseInterceptor from '@interceptors/wrap-response.interceptor';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import validationPipe from '@pipes/validation.pipe';
import { AppModule } from './components/app/app.module';

// const { version } = require('../package.json');
const { PORT } = process.env;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(validationPipe);
    app.useGlobalInterceptors(new WrapResponseInterceptor());

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    const config = new DocumentBuilder()
        .setTitle('Onix sports swagger')
        .setDescription('Onix sports API')
        .setVersion('2')
        .addTag('Onix Sports')
        .addBearerAuth({ in: 'header', type: 'http' })
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.enableCors();

    await app.listen(PORT as string);

    console.log(`http://localhost:${PORT}/`);
}
bootstrap();
