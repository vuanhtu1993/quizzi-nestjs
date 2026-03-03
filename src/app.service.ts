import { Injectable, Inject } from '@nestjs/common';
import { EMAIL_SERVICE } from './fundamentals/provider/email.service';
import type { IEmailService } from './fundamentals/provider/email.service';
import { APP_CONFIG } from './fundamentals/provider/app.config';
import type { AppConfig } from './fundamentals/provider/app.config';

/**
 * @file app.service.ts (thay thế app.service.ts gốc)
 * @description AppService tổng hợp – inject tất cả 4 loại provider để demo.
 *
 * Service này đóng vai trò "khách hàng" sử dụng các provider:
 * - EMAIL_SERVICE  → được cung cấp bởi useClass (RealEmailService/MockEmailService)
 * - APP_CONFIG     → được cung cấp bởi useValue (appConfig object)
 * - DB_CONNECTION  → được cung cấp bởi useFactory (async DatabaseConnection)
 * - NOTIFICATION_LOGGER → được cung cấp bởi useExisting (alias của APP_LOGGER)
 */

// Token dùng cho useFactory và useExisting
export const DB_CONNECTION = 'DB_CONNECTION';
export const APP_LOGGER = 'APP_LOGGER';
export const NOTIFICATION_LOGGER = 'NOTIFICATION_LOGGER';

// ─── Simple Logger class (sẽ dùng cho useExisting demo) ───────────────────
@Injectable()
export class AppLogger {
  log(msg: string): string {
    const logLine = `[AppLogger] ${new Date().toISOString()} → ${msg}`;
    console.log(logLine);
    return logLine;
  }
}

// ─── DatabaseConnection (tạo bởi useFactory) ──────────────────────────────
export class DatabaseConnection {
  constructor(public readonly connectionString: string) { }

  ping(): string {
    return `[DB PING] Connected to: ${this.connectionString}`;
  }
}

// ─── Main AppService ───────────────────────────────────────────────────────
@Injectable()
export class AppService {
  constructor(
    // 1️⃣  useClass  – inject EmailService (Real hoặc Mock tùy AppModule)
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,

    // 2️⃣  useValue  – inject config object tĩnh
    @Inject(APP_CONFIG) private readonly config: AppConfig,

    // 3️⃣  useFactory – inject DB connection được tạo async
    @Inject(DB_CONNECTION) private readonly db: DatabaseConnection,

    // 4️⃣  useExisting – inject qua alias, cùng instance với APP_LOGGER
    @Inject(NOTIFICATION_LOGGER) private readonly logger: AppLogger,
  ) { }

  // ── Endpoint: GET /  ────────────────────────────────────────────────────
  getHello(): string {
    return `Hello from ${this.config.appName} v${this.config.version}!`;
  }

  // ── Endpoint: GET /demo/use-class  ──────────────────────────────────────
  demoUseClass(): string {
    // Ở đây AppService KHÔNG BIẾT đang dùng Real hay Mock – Module quyết định
    return this.emailService.send('student@uni.edu.vn', 'Chào mừng bạn đến với Quizzi!');
  }

  // ── Endpoint: GET /demo/use-value  ──────────────────────────────────────
  demoUseValue(): string {
    return (
      `App: ${this.config.appName} | ` +
      `Version: ${this.config.version} | ` +
      `Env: ${this.config.environment} | ` +
      `Max Upload: ${this.config.maxUploadSizeMB}MB`
    );
  }

  // ── Endpoint: GET /demo/use-factory  ────────────────────────────────────
  demoUseFactory(): string {
    // DB connection đã được khởi tạo async trước khi AppService nhận được
    return this.db.ping();
  }

  // ── Endpoint: GET /demo/use-existing  ───────────────────────────────────
  demoUseExisting(): string {
    // NOTIFICATION_LOGGER là alias → cùng instance với APP_LOGGER (Singleton)
    return this.logger.log('useExisting: NOTIFICATION_LOGGER dùng cùng instance với APP_LOGGER');
  }
}
