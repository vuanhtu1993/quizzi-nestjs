import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';


// Tích hợp các thành phần AOP toàn cục
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  /**
   * NestFactory là lớp cốt lõi của NestJS dùng để khởi tạo instance ứng dụng.
   * Phương thức static create() nhận vào module gốc (AppModule) để thiết lập 
   * toàn bộ hệ thống Dependency Injection và các module liên quan.
   */
  const app = await NestFactory.create(AppModule);

  // PIPE TOÀN CỤC = Bộ phận xử lý dữ liệu đầu vào cho mọi Request.
  app.useGlobalPipes(new ValidationPipe());

  // [INTERCEPTOR TOÀN CỤC] = Bộ phận đóng gói đầu ra cho mọi Request thành công.
  app.useGlobalInterceptors(new TransformInterceptor());

  // [EXCEPTION FILTER TOÀN CỤC] = Bộ phận xử lý sự cố chung cho mọi Lỗi (Exception) xảy ra.
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
