import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

/**
 * Ẩn dụ: Bảo vệ kiểm tra thẻ nhân viên (Guard)
 * WHY: Guard sinh ra duy nhất để trả lời câu hỏi "Cho qua hay Không cho qua?".
 * Trong Quiz giống Kahoot, chỉ người nắm quyền Host (Ví dụ giáo viên) mới được phép "Bắt đầu Quiz".
 * Nếu để logic này ở Service, ta đang vi phạm Single Responsibility Principle (Service chỉ nên lo nghiệp vụ, auth là việc của Guard).
 */
@Injectable()
export class HostGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Kiểm tra header x-role xem có phải host không
    const role = request.headers['x-role'];
    
    if (role !== 'host') {
      // Báo thẳng lỗi Forbidden nếu không có quyền
      throw new ForbiddenException('Chỉ có Host mới được phép thực hiện thao tác này!');
    }
    
    // Trả về true tức là Guard cho phép request đi tiếp vào Controller
    return true;
  }
}
