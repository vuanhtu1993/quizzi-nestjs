import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LogMiddleware } from './log/log.middleware';
import { ParticipantMiddleware } from './common/middlewares/participant.middleware';
import { QuizModule } from './quiz/quiz.module';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';

import compression from 'compression';
import cookieParser from 'cookie-parser';

// ─── Import các service và config ──────────────────────────────────────────
import { AppService, AppLogger, DatabaseConnection, DB_CONNECTION, APP_LOGGER, NOTIFICATION_LOGGER } from './app.service';
import { EMAIL_SERVICE, RealEmailService, MockEmailService } from './fundamentals/provider/email.service';
import { APP_CONFIG, appConfig } from './fundamentals/provider/app.config';

/**
 * @file app.module.ts
 * @description Áp dụng 4 cách khai báo Provider vào thực tế.
 *
 * MODULE = "Hợp đồng tổng" chỉ định cho NestJS IoC Container biết:
 * "Khi ai cần X, hãy tạo/trả về Y theo cách Z."
 */
@Module({
  imports: [QuizModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    // ────────────────────────────────────────────────────────────────────
    // 1️⃣  useClass – Swap implementation tùy môi trường
    //
    // WHY: AppService chỉ biết nó cần "một thứ implement IEmailService".
    // MODULE quyết định: Dev/Test → MockEmailService (không gửi email thật)
    //                    Production → RealEmailService (gửi email thật)
    // Chỉ đổi 1 dòng này, KHÔNG cần sửa AppService.
    // ────────────────────────────────────────────────────────────────────
    {
      provide: EMAIL_SERVICE,
      useClass: process.env.NODE_ENV === 'production'
        ? RealEmailService   // gửi email thật qua AWS SES / SendGrid
        : MockEmailService,  // log ra console, an toàn cho dev & CI/CD
    },

    // ────────────────────────────────────────────────────────────────────
    // 2️⃣  useValue – Inject một giá trị / object đã tạo sẵn
    //
    // WHY: appConfig là plain object, không có lifecycle, không cần async.
    // NestJS inject ĐÚNG OBJECT NÀY, không new thêm bất cứ thứ gì.
    // Hoàn hảo cho: config objects, constants, mock objects trong test.
    // ────────────────────────────────────────────────────────────────────
    {
      provide: APP_CONFIG,
      useValue: appConfig,
    },

    // ────────────────────────────────────────────────────────────────────
    // 3️⃣  useFactory – Tạo provider qua factory function (có thể async)
    //
    // WHY: DatabaseConnection cần đọc config từ ConfigService trước khi
    // khởi tạo. NestJS sẽ await factory function này trước khi inject vào
    // AppService – đảm bảo DB đã sẵn sàng khi app bắt đầu serve request.
    // ────────────────────────────────────────────────────────────────────
    {
      provide: DB_CONNECTION,
      // `inject` liệt kê các provider được truyền vào factory theo thứ tự
      inject: [APP_CONFIG],
      useFactory: async (config: typeof appConfig): Promise<DatabaseConnection> => {
        // Giả lập async: đọc DB credentials từ config, thiết lập connection pool...
        await new Promise<void>((resolve) => setTimeout(resolve, 50));

        const host = process.env.DB_HOST ?? 'localhost';
        const port = process.env.DB_PORT ?? '5432';
        const connStr = `postgresql://${host}:${port}/${config.appName.toLowerCase()}_db`;

        console.log(`[useFactory] DB Connection ready: ${connStr}`);
        return new DatabaseConnection(connStr);
      },
    },

    // ────────────────────────────────────────────────────────────────────
    // 4️⃣  useExisting – Tạo alias cho một provider đã tồn tại
    //
    // WHY: AppLogger đã được đăng ký và quản lý bởi NestJS (Singleton).
    // NotificationService cần inject Logger qua token NOTIFICATION_LOGGER.
    // useExisting → KHÔNG tạo thêm instance mới, tái sử dụng AppLogger.
    // Tiết kiệm bộ nhớ và đảm bảo chỉ có 1 instance duy nhất.
    // ────────────────────────────────────────────────────────────────────
    AppLogger, // phải đăng ký provider gốc trước
    {
      provide: NOTIFICATION_LOGGER,
      useExisting: AppLogger, // alias → cùng 1 Singleton instance với AppLogger
    },

    // ─── AppService và AppController cần được đăng ký để inject hoạt động ─
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // Nhóm 1: Áp dụng Logger cho TẤT CẢ các route (giám sát chung)
      .apply(
        // 1. Phổ quát: Nén dữ liệu HTTP để tăng tốc độ truyền tải
        compression(),
        // 2. Express cũ: Giải mã cookie từ header request
        cookieParser(),
        // 3. Giám sát: Log thông tin mọi request đi qua hệ thống
        LogMiddleware
      )
      .forRoutes('*'); // Áp dụng cho TẤT CẢ các route

    // Nhóm 2: Áp dụng ParticipantMiddleware cho các route liên quan đến Quiz
    consumer
      .apply(ParticipantMiddleware)
      .forRoutes('quiz');
  }
}

// export class AppModule { };
