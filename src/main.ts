import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogMiddleware } from './log/log.middleware';
import { NextFunction } from 'express';

async function bootstrap() {
  /**
   * NestFactory là lớp cốt lõi của NestJS dùng để khởi tạo instance ứng dụng.
   * Phương thức static create() nhận vào module gốc (AppModule) để thiết lập 
   * toàn bộ hệ thống Dependency Injection và các module liên quan.
   */
  const app = await NestFactory.create(AppModule);

  // Có thể triển khai middleware toàn cục tại đây
  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   console.log(new Date().toISOString(), req.url);
  //   next();
  //   console.log(new Date().toISOString(), req.url)
  // });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
