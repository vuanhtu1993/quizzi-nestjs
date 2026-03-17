import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * @file http-exception.filter.ts
 * @description Exception Filter giúp tùy biến cấu trúc response khi có lỗi xảy ra.
 * 
 * Ẩn dụ: Đội xử lý sự cố (Incident Response Team) bọc lại lỗi thô thành thông báo chuyên nghiệp.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Lấy message lỗi (có thể là string hoặc object từ NestJS)
    const message = typeof exceptionResponse === 'object'
      ? (exceptionResponse as any).message || exception.message
      : exceptionResponse;

    console.log(`[HttpExceptionFilter] Đang xử lý lỗi ${status}: ${message}`);

    // Trả về cấu trúc JSON tùy biến
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        error: {
          name: exception.name,
          message: message,
        },
        signature: 'Made by Anh Tu - Share to be share', // Chữ ký định danh
      });
  }
}
