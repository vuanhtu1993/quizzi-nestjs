import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  /**
   * NestFactory là lớp cốt lõi của NestJS dùng để khởi tạo instance ứng dụng.
   * Phương thức static create() nhận vào module gốc (AppModule) để thiết lập 
   * toàn bộ hệ thống Dependency Injection và các module liên quan.
   */
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
