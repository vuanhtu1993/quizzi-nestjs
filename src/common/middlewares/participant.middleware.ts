import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Mở rộng interface Request của Express để TypeScript không báo lỗi khi ta gán thêm property
export interface QuizRequest extends Request {
  participant?: string;
}

/**
 * Ẩn dụ: Nhân viên lễ tân ở cửa ra vào (Middleware)
 * WHY: Chúng ta sử dụng Middleware ở đây để xử lý tự động việc nhận diện người dùng 
 * tham gia phòng trước khi request đến được Controller.
 * Thay vì để Controller phải tự check Headers, Middleware đảm nhận "việc tay chân" này.
 */
@Injectable()
export class ParticipantMiddleware implements NestMiddleware {
  use(req: QuizRequest, res: Response, next: NextFunction) {
    // Trích xuất thông tin người chơi từ Header để biết ai đang gọi API
    const participantName = req.headers['x-participant-name'] as string;

    if (participantName) {
      // Gán vào đối tượng Request để Controller/Service có thể lấy ra dùng
      req.participant = participantName;
    }

    // Tiếp tục chuyển request đi tới trạm tiếp theo
    next();
  }
}
