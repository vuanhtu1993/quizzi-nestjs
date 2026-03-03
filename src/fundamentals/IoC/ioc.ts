
/**
 * @file ioc.ts
 * @description Tìm hiểu về Inversion of Control (IoC) - Từ lý thuyết đến thực hành trong NestJS.
 * 
 * 1. ẨN DỤ (ANALOGY):
 * - Không IoC: Bạn muốn uống cà phê, bạn phải tự đi mua hạt, tự xay, tự pha. Bạn lệ thuộc vào nguyên liệu mình có.
 * - Có IoC: Bạn ra quán, gọi "Cho một ly cà phê!". Nhân viên (IoC Container) sẽ chuẩn bị và mang ra.
 *   Bạn không quan tâm máy pha cà phê hiệu gì, bạn chỉ việc thưởng thức.
 */

// ============================================================
// PHẦN 1: KHI KHÔNG SỬ DỤNG IOC (TIGHT COUPLING)
// ============================================================
class ManualLogger {
    log(msg: string) { console.log(`[Manual]: ${msg}`); }
}

class ManualService {
    // VẤN ĐỀ: Service tự khởi tạo Logger. 
    // Nếu muốn đổi sang một loại Logger khác, ta phải sửa code bên trong class này.
    private logger = new ManualLogger();

    run() {
        this.logger.log("Đang chạy mà không có IoC...");
    }
}
/**
* Nhận xét: Module lớn phụ thuộc vào module nhỏ, Module ManualService phụ thuộc vào ManualLogger
* vì muốn thay đổi cần phải sửa lại code ManualService
*/

/**
// ============================================================
// PHẦN 2: ÁP DỤNG IOC CƠ BẢN (DEPENDENCY INJECTION - DI)
// ============================================================

 * ẨN DỤ: Interface ILogger giống như một "Hợp đồng" hoặc "Ổ cắm điện chuẩn EU".
 * Thiết bị (IoCService) chỉ cần biết là nó có lỗ cắm tròn để lấy điện, 
 * còn điện đến từ Thủy điện hay Điện hạt nhân thì nó không quan tâm.
 */
interface ILogger {
    log(msg: string): void;
}

// Concrete Implementation 1: Ghi log ra Console
class ConsoleLogger implements ILogger {
    log(msg: string) { console.log(`[Console]: ${msg}`); }
}

// Concrete Implementation 2: Ghi log ra File (Giả lập)
class FileLogger implements ILogger {
    log(msg: string) { console.log(`[File]: Lưu "${msg}" vào ổ cứng...`); }
}

class IoCService {
    // Dependency Injection: "Tiêm" phụ thuộc thông qua Constructor.
    // IoCService bây giờ không biết mình đang dùng ConsoleLogger hay FileLogger.
    // Nó chỉ biết mình đang dùng một thứ tuân thủ "hợp đồng" ILogger.
    constructor(private logger: ILogger) { }

    run() {
        // Nếu ta không truyền (inject) một đối tượng cụ thể vào constructor, 
        // code sẽ báo lỗi ngay lập tức (Null Reference).
        this.logger.log("Đang chạy với cơ chế DI thủ công!");
    }
}

// CÁCH VẬN HÀNH:
// 1. Bạn (người dùng) đóng vai trò là "IoC Container" thủ công.
// 2. Bạn quyết định loại Logger nào sẽ được sử dụng.
const logger = new ConsoleLogger();
const service = new IoCService(logger); // "Tiêm" dependency vào
service.run(); // Kết quả: [Console]: Đang chạy với cơ chế DI thủ công!

/**
 * Nhận xét: IoCService không phụ thuộc vào module nhỏ hơn FileLogger hoặc ConsoleLogger
 * vì chỉ cần truyền service vào constructor không cần sửa code
 */



// ============================================================
// PHẦN 3: IOC TRONG NESTJS (AUTOMATED IOC CONTAINER)
// ============================================================
import { Injectable, Module } from '@nestjs/common';

/**
 * BƯỚC 1: ĐỊNH NGHĨA PROVIDER
 * @Injectable() đánh dấu class này để NestJS IoC Container quản lý.
 */
@Injectable()
export class NestLogger {
    log(message: string) {
        console.log(`[NestJS IoC]: ${message}`);
    }
}

/**
 * BƯỚC 2: DEPENDENCY INJECTION
 * NestJS sẽ tự động tìm instance của NestLogger và "tiêm" vào đây.
 */
@Injectable()
export class AppService {
    constructor(private readonly logger: NestLogger) { }

    run() {
        this.logger.log('Ứng dụng vận hành mượt mà nhờ IoC Container!');
    }
}

/**
 * BƯỚC 3: ĐĂNG KÝ VỚI MODULE
 * Đây là nơi khai báo để Container biết các "mảnh ghép" cần khởi tạo.
 */
@Module({
    providers: [NestLogger, AppService],
})
export class AppModule { }

/**
 * TỔNG KẾT:
 * - Loose Coupling: Dễ dàng thay thế các thành phần mà không làm hỏng logic chính.
 * - Testability: Dễ dàng thay Logger thật bằng MockLogger khi viết Unit Test.
 * - Singleton Pattern: NestJS mặc định chỉ tạo một instance duy nhất, tiết kiệm bộ nhớ.
 * 
 * ĐÁNH ĐỔI (TRADE-OFF):
 * - "Magic": Người mới có thể thấy khó hiểu vì không thấy từ khóa `new`.
 * - Runtime Error: Nếu quên khai báo trong `providers`, ứng dụng sẽ crash khi khởi động.
 * 
 * IOC - Đảo ngược sự phụ thuộc là gì ?
 * Nếu theo mô hình cũ nhưng module lớn sẽ phụ thuộc vào module nhỏ hơn (điều này là không hợp lý)
 * Đảo ngược sự phụ thuộc tức là module nhỏ sẽ phu thuộc vào module lớn hơn
 * 
 * DI - Dependency Injection
 * Là một phương pháp để giải quyết vấn đề của IOC đã được cài đặt sẵn trong NestJS
 * Made by Anh Tu - Share to be share
 */