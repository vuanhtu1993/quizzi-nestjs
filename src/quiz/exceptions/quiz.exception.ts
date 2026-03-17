import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Ẩn dụ: Bảng nội quy tuỳ chỉnh
 * WHY: Chúng ta định nghĩa các lỗi Custom để Service tái sử dụng, giúp code ngữ nghĩa hơn
 * thay vì chỗ nào cũng quăng NotFoundException cơ bản
 */
export class QuizNotFoundException extends HttpException {
  constructor() {
    super('Không tìm thấy phòng Quiz với mã PIN này', HttpStatus.NOT_FOUND);
  }
}

export class QuizInvalidStateException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
