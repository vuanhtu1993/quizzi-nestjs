import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { QuizRequest } from '../middlewares/participant.middleware';

/**
 * Ẩn dụ: Nhãn tên ghi nhanh (Custom Decorator)
 * WHY: Thay vì lúc nào cũng phải chọc vào ngóc ngách của req.participant thủ công trong Controller,
 * tạo một Decorator @Participant() giúp tham số Controller gọn gàng, đọc lướt qua là lập tức hiểu ngay.
 * Code của bạn sẽ càng có tính khai báo (Declarative) mạnh hơn!
 */
export const Participant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<QuizRequest>();
    return request.participant;
  },
);
