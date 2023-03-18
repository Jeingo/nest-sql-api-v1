import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from './configuration/configuration';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './helper/expception-filter/exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<IConfigType>);

  const config = new DocumentBuilder()
    .setTitle('Blogger Api')
    .setDescription(
      `Blogger can register and create blogs and posts . Users can create comment and likes`
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(configService.get('port'));
}
bootstrap();
