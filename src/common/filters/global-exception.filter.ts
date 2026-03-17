import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Ẩn dụ: Đội ngũ dọn dẹp và viết báo cáo sự cố (Exception Filter)
 * WHY: Khi có lỗi xảy ra (do Code throw ra), thay vì vứt cho người dùng một cái Object lõng chõng hay Node.js sập nguồn,
 * ExceptionFilter đứng ra "hứng" lỗi đó, và dịch nó ra ngôn ngữ thân thiện, định dạng giống hệt như chuẩn format thành công 
 * (đều có statusCode, message) để App Mobile/Web dễ xử lý.
 * Áp dụng cách này, chúng ta không cần dùng try/catch thủ công cồng kềnh trong mỗi Controller nữa.
 */
@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Phân tích message lỗi tuỳ theo nó là chuỗi hay object
    const exceptionResponse = exception.getResponse();
    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as any).message || exception.message;

    response
      .status(status)
      .json({
        statusCode: status,
        message: Array.isArray(message) ? message.join('; ') : message,
        data: null, // Khi có lỗi đương nhiên data trống
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
