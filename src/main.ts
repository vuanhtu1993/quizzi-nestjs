import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogMiddleware } from './log/log.middleware';
import { NextFunction } from 'express';
import { LoginGuard } from './login/login.guard';
import { TimeInterceptor } from './time/time.interceptor';

async function bootstrap() {
  /**
   * NestFactory là lớp cốt lõi của NestJS dùng để khởi tạo instance ứng dụng.
   * Phương thức static create() nhận vào module gốc (AppModule) để thiết lập 
   * toàn bộ hệ thống Dependency Injection và các module liên quan.
   */
  const app = await NestFactory.create(AppModule);

  // CÓ THỂ TRIỂN KHAI MIDDLEWARE TOÀN CỤC
  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   console.log(new Date().toISOString(), req.url);
  //   next();
  //   console.log(new Date().toISOString(), req.url)
  // });

  // CÓ THỂ TRIỂN KHAI GUARD TOÀN CỤC
  // app.useGlobalGuards(new LoginGuard());

  // CÓ THỂ TRIỂN KHAI INTERCEPTOR TOÀN CỤC
  // app.useGlobalInterceptors(new TimeInterceptor());


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
