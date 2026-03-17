import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Ẩn dụ: Bộ phận đóng gói sản phẩm (Interceptor)
 * WHY: Interceptor sinh ra để "thay hình đổi dạng" đầu vào hoặc đầu ra.
 * Ta sử dụng TransformInterceptor để đảm bảo định dạng dữ liệu trả về cho client LUÔN LUÔN
 * đồng nhất: { statusCode, message, data, timestamp }.
 * Controller chỉ việc return dữ liệu dạng thô, phần "gói gém" đẹp đẽ để Interceptor lo.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    // next.handle() gọi đến luồng xử lý chính trong Controller
    return next.handle().pipe(
      // Sau khi Controller xử lý xong, map() sẽ bọc dữ liệu thô (data) thành Format chuẩn
      map(data => ({
        statusCode: response.statusCode,
        message: 'Thao tác thành công',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
