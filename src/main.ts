import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina datos extra
    forbidNonWhitelisted: true, // Lanza error si mandan datos que no deberían
    transform: true, // Transforma los datos a los tipos correctos
  }));

  await app.listen(envs.PORT);
  console.log(`PetRadar API corriendo en: http://localhost:${envs.PORT}`);
}
bootstrap();
