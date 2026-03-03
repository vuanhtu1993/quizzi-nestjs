
/**
 * @file providers.ts
 * @description 4 cách khai báo Provider trong NestJS - Từ lý thuyết đến thực hành.
 *
 * ẨN DỤ (ANALOGY):
 * Provider giống như một "hợp đồng cung ứng dịch vụ" trong Module.
 * Bạn khai báo với NestJS: "Khi ai đó cần X, hãy cung cấp Y theo cách Z."
 * Có 4 cách (Z) để chỉ định NestJS "cung cấp" như thế nào:
 *   1. useClass   → "Dùng đúng class/instance này nhé"
 *   2. useValue   → "Dùng đúng giá trị/object có sẵn này nhé"
 *   3. useFactory → "Gọi hàm này để tạo ra giá trị, vì nó phức tạp/async"
 *   4. useExisting → "Cái đó ư? Alias sang cái đã có sẵn rồi thôi"
 */

import { Injectable, Module, Inject } from '@nestjs/common';

// ============================================================
// CÁCH 1: useClass
// KHI NÀO DÙNG: Bạn muốn swap implementation tùy môi trường
// (vd: MockEmailService khi test, RealEmailService khi production).
// ============================================================

/**
 * ẨN DỤ: useClass giống như "Tôi cần một phiên dịch viên, hãy thuê người này".
 * Bạn chỉ định chính xác CLASS nào sẽ được instantiate và inject.
 */
interface IEmailService {
    sendEmail(to: string, subject: string): void;
}

@Injectable()
class RealEmailService implements IEmailService {
    sendEmail(to: string, subject: string) {
        // Trong thực tế: gọi AWS SES, SendGrid, v.v.
        console.log(`[REAL] Đang gửi email thật đến ${to}: "${subject}"`);
    }
}

@Injectable()
class MockEmailService implements IEmailService {
    sendEmail(to: string, subject: string) {
        // Không gửi email thật, chỉ log ra console để test dễ dàng hơn
        console.log(`[MOCK] Giả vờ gửi email đến ${to}: "${subject}"`);
    }
}

@Injectable()
class NotificationService {
    // NestJS sẽ inject đúng implementation được khai báo trong Module bên dưới
    constructor(@Inject('EMAIL_SERVICE') private emailService: IEmailService) { }

    notifyUser(email: string) {
        this.emailService.sendEmail(email, 'Chào mừng bạn!');
    }
}

const isProduction = process.env.NODE_ENV === 'production';

@Module({
    providers: [
        NotificationService,
        {
            provide: 'EMAIL_SERVICE',
            // ĐIỂM MẠNH: Chỉ thay đổi 1 dòng này, toàn bộ ứng dụng đổi behavior.
            // Trong test environment: dùng MockEmailService (không gửi email thật)
            // Trong production: dùng RealEmailService (gửi email thật)
            useClass: isProduction ? RealEmailService : MockEmailService,
        },
    ],
})
export class UseClassExampleModule { }

/*
 * TRADE-OFF:
 * ✅ Linh hoạt: Swap implementation không cần sửa code business logic.
 * ✅ Testable: MockEmailService ngăn gửi email thật trong CI/CD pipeline.
 * ⚠️  NestJS tự quản lý lifecycle, có thể gây khó debug nếu class có side effect trong constructor.
 */



// ============================================================
// CÁCH 2: useValue
// KHI NÀO DÙNG: Tiêm một config object, một mock object đã tạo sẵn,
// hoặc một constant (string, number, object thuần).
// ============================================================

/**
 * ẨN DỤ: useValue giống như "Đây là chìa khóa phòng 101, hãy dùng đúng cái này".
 * Bạn không cần NestJS "chế tạo" gì cả – bạn đã có sẵn giá trị, chỉ cần inject vào.
 */

// Thường dùng Symbol hoặc string literal làm "token" để tránh conflict tên
const APP_CONFIG = 'APP_CONFIG';
const SMTP_HOST = 'SMTP_HOST';

interface AppConfig {
    appName: string;
    version: string;
    maxUploadSizeMB: number;
}

// Config object được tạo thủ công NHƯ MỘT JAVASCRIPT OBJECT THUẦN
const appConfig: AppConfig = {
    appName: 'Quizzi',
    version: '1.0.0',
    maxUploadSizeMB: 50,
};

@Injectable()
class ConfigConsumerService {
    constructor(
        // @Inject(token) là bắt buộc khi dùng custom token (không phải class)
        @Inject(APP_CONFIG) private config: AppConfig,
        @Inject(SMTP_HOST) private smtpHost: string,
    ) { }

    printConfig() {
        console.log(`App: ${this.config.appName} v${this.config.version}`);
        console.log(`SMTP Host: ${this.smtpHost}`);
    }
}

@Module({
    providers: [
        ConfigConsumerService,
        {
            provide: APP_CONFIG,
            // useValue nhận bất kỳ giá trị nào: object, string, number, function, ...
            useValue: appConfig,
        },
        {
            provide: SMTP_HOST,
            useValue: 'smtp.gmail.com', // inject thẳng một string literal
        },
    ],
})
export class UseValueExampleModule { }

/*
 * TRADE-OFF:
 * ✅ Đơn giản: Không cần class, không cần decorator, không có overhead.
 * ✅ Hoàn hảo cho mock trong Unit Test: `{ provide: EmailService, useValue: mockEmailService }`.
 * ⚠️  Giá trị là static, không thể tạo async hay phụ thuộc provider khác → dùng useFactory khi đó.
 */



// ============================================================
// CÁCH 3: useFactory
// KHI NÀO DÙNG: Provider cần kết quả từ async (đọc DB, gọi API),
// hoặc phụ thuộc vào provider khác để khởi tạo.
// ============================================================

/**
 * ẨN DỤ: useFactory giống như "Thuê đầu bếp (factory function) nấu món ăn.
 * Đầu bếp có thể chờ nguyên liệu tươi từ chợ (async), và sử dụng các dụng cụ
 * từ nhà bếp (inject providers khác) trước khi phục vụ".
 */

// Giả lập ConfigService đã có sẵn trong ứng dụng
@Injectable()
class ConfigService {
    get(key: string): string {
        // Trong thực tế, đọc từ .env hoặc database
        const fakeEnv: Record<string, string> = {
            DB_HOST: 'localhost',
            DB_PORT: '5432',
            DB_NAME: 'quizzi_db',
        };
        return fakeEnv[key] ?? '';
    }
}

// Giả lập DatabaseConnection object được tạo ra từ factory
class DatabaseConnection {
    constructor(public readonly connectionString: string) { }

    query(sql: string) {
        console.log(`[DB → ${this.connectionString}] Executing: ${sql}`);
    }
}

const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Injectable()
class UserRepository {
    constructor(
        @Inject(DATABASE_CONNECTION) private db: DatabaseConnection
    ) { }

    findAll() {
        this.db.query('SELECT * FROM users');
    }
}

@Module({
    providers: [
        ConfigService,
        UserRepository,
        {
            provide: DATABASE_CONNECTION,
            // `inject` array: liệt kê các provider sẽ được truyền vào factory function
            inject: [ConfigService],
            // useFactory CÓ THỂ là async – NestJS sẽ await kết quả trước khi inject
            useFactory: async (configService: ConfigService): Promise<DatabaseConnection> => {
                const host = configService.get('DB_HOST');
                const port = configService.get('DB_PORT');
                const name = configService.get('DB_NAME');

                // Mô phỏng async operation: thiết lập connection, kiểm tra health, v.v.
                await new Promise(resolve => setTimeout(resolve, 100)); // giả lập async

                const connectionString = `postgresql://${host}:${port}/${name}`;
                console.log(`[Factory] Khởi tạo DB connection: ${connectionString}`);
                return new DatabaseConnection(connectionString);
            },
        },
    ],
})
export class UseFactoryExampleModule { }

/*
 * TRADE-OFF:
 * ✅ Mạnh nhất: Hỗ trợ async, inject dependencies khác, logic động.
 * ✅ Một pattern: useFactory luôn chạy sau khi tất cả provider trong `inject` đã sẵn sàng.
 * ⚠️  Verbose hơn useClass/useValue, cần đảm bảo thứ tự trong `inject` khớp với tham số factory.
 * ⚠️  Nếu factory throw exception, toàn bộ module sẽ fail khi khởi động.
 */



// ============================================================
// CÁCH 4: useExisting
// KHI NÀO DÙNG: Bạn muốn tạo một "bí danh" (alias) cho một provider
// đã tồn tại, thường để đáp ứng nhiều interface khác nhau.
// ============================================================

/**
 * ẨN DỤ: useExisting giống như bảng tên cửa hàng:
 * Cửa hàng tên "Phở Hà Nội" và "Phở Gia Truyền" đều là CÙNG MỘT QUÁN.
 * Dù gọi bằng tên nào, bạn cũng đến đúng một nơi và ăn cùng một bát phở.
 * Chỉ có MỘT instance, nhưng có hai cái tên để tìm đến nó.
 */

// Ví dụ thực tế: WinstonLogger đã được đăng ký sẵn, nhưng
// legacy code sử dụng interface khác tên. Ta dùng useExisting để bridge.

interface ILogger {
    log(msg: string): void;
}

interface ILegacyLogger {
    write(msg: string): void; // interface cũ, tên method khác
}

// WinstonLogger thực tế được implement cả hai interface
@Injectable()
class WinstonLogger implements ILogger, ILegacyLogger {
    log(msg: string) {
        console.log(`[Winston] ${msg}`);
    }

    // Implement interface cũ để backward compatible
    write(msg: string) {
        this.log(msg); // Dùng lại logic
    }
}

const LOGGER = 'LOGGER';
const LEGACY_LOGGER = 'LEGACY_LOGGER'; // alias cho LOGGER

@Injectable()
class ModernService {
    constructor(@Inject(LOGGER) private logger: ILogger) { }

    doWork() { this.logger.log('ModernService đang làm việc...'); }
}

@Injectable()
class LegacyService {
    // Legacy code expect interface cũ với method `write`, KHÔNG phải `log`
    constructor(@Inject(LEGACY_LOGGER) private logger: ILegacyLogger) { }

    doOldWork() { this.logger.write('LegacyService đang làm việc theo cách cũ...'); }
}

@Module({
    providers: [
        // WinstonLogger được tạo một lần duy nhất (Singleton)
        WinstonLogger,
        {
            provide: LOGGER,
            useClass: WinstonLogger, // hoặc đăng ký trực tiếp class
        },
        {
            provide: LEGACY_LOGGER,
            // useExisting trỏ đến token LOGGER đã tồn tại.
            // NestJS KHÔNG tạo instance mới, mà tái sử dụng instance đã có.
            useExisting: LOGGER,
        },
        ModernService,
        LegacyService,
    ],
})
export class UseExistingExampleModule { }

/*
 * TRADE-OFF:
 * ✅ Không tạo thêm instance: Tiết kiệm bộ nhớ, đảm bảo shared state nhất quán.
 * ✅ Backward compatible: Bridge giữa code cũ và mới mà không cần refactor toàn bộ.
 * ⚠️  Có thể gây nhầm lẫn: Hai token → một instance, người đọc code phải chú ý.
 * ⚠️  Provider gốc phải được đăng ký trước, nếu không NestJS sẽ throw lỗi.
 */

/**
 * TỔNG KẾT - CHỌN ĐÚNG CÁI GÌ KHI NÀO:
 * ┌─────────────┬────────────────────────────────────────────────────────────┐
 * │  Cách       │  Khi nào dùng                                              │
 * ├─────────────┼────────────────────────────────────────────────────────────┤
 * │ useClass    │ Swap implementation (Mock vs Real, Dev vs Prod)            │
 * │ useValue    │ Config object, hằng số, mock object đã tạo sẵn            │
 * │ useFactory  │ Cần async, cần inject provider khác để khởi tạo           │
 * │ useExisting │ Tạo alias cho token đã có, bridge code cũ và mới          │
 * └─────────────┴────────────────────────────────────────────────────────────┘
 *
 * Made by Anh Tu - Share to be share
 */
