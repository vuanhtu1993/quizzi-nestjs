import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * @file video-status.pipe.ts
 * @description Minh họa Custom Pipe với 2 chức năng: Biến đổi (Transformation) và Xác thực (Validation).
 * 
 * WHY: Chúng ta muốn đảm bảo status truyền lên luôn là chữ IN HOA 
 * và phải thuộc danh sách cho phép (PUBLIC, DRAFT, PRIVATE).
 */
@Injectable()
export class VideoStatusPipe implements PipeTransform {
  // Danh sách các trạng thái hợp lệ
  readonly allowedStatuses = [
    'PUBLIC',
    'DRAFT',
    'PRIVATE',
  ];

  /**
   * Phương thức transform là nơi xử lý logic chính của Pipe.
   * @param value Giá trị đầu vào từ request
   * @param metadata Chứa thông tin về tham số đang được xử lý
   */
  transform(value: any, metadata: ArgumentMetadata) {
    console.log(`[VideoStatusPipe] Đang xử lý giá trị: ${value}`);

    // 1. Transformation: Chuyển về chữ hoa (Lọc nước đục thành nước trong)
    const status = value.toString().toUpperCase();

    // 2. Validation: Kiểm tra xem có nằm trong danh sách cho phép không
    if (!this.isStatusValid(status)) {
      throw new BadRequestException(`"${status}" không phải là trạng thái hợp lệ! (Cho phép: ${this.allowedStatuses.join(', ')})`);
    }

    return status;
  }

  private isStatusValid(status: any) {
    return this.allowedStatuses.indexOf(status) !== -1;
  }
}
