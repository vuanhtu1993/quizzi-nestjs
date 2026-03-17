import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * Ẩn dụ: Máy quét kích thước hành lý ở sân bay (Pipe)
 * WHY: Pipe có 2 nhiệm vụ chính: Biến đổi (Transformation) và Xác thực (Validation).
 * Ở đây ta dùng Pipe để xác thực xem mã PIN người dùng nhập có đúng định dạng 6 chữ số không.
 * Nếu dùng if/else trong Controller thì Controller sẽ bị "ô nhiễm" bởi logic validation, vi phạm Clean Code.
 */
@Injectable()
export class JoinCodeValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    const pinString = String(value);
    
    // Kiểm tra PIN có phải đúng 6 chữ số không
    const isValid = /^\d{6}$/.test(pinString);
    
    if (!isValid) {
      throw new BadRequestException('Mã PIN tham gia phòng phải bao gồm đúng 6 chữ số!');
    }
    
    return pinString;
  }
}
