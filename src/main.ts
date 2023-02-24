import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from './configuration/configuration';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './helper/expception-filter/exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<IConfigType>);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(configService.get('port'));
}
bootstrap();
