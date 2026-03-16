import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * @file product-price.pipe.ts
 * @description Pipe xử lý giá sản phẩm trong E-commerce.
 * 
 * Ẩn dụ: Nhân viên thu ngân kiểm tra hóa đơn.
 * - Validation: Đảm bảo giá không âm.
 * - Transformation: Làm tròn số tiền và chuyển về kiểu Number.
 */
@Injectable()
export class ProductPricePipe implements PipeTransform {
  /**
   * @param value Giá trị nhận từ Query hoặc Param (thường là string)
   * @param metadata Thông tin về tham số
   */
  transform(value: any, metadata: ArgumentMetadata): number {
    const price = parseFloat(value);

    // 1. Validation: Kiểm tra xem có phải là số không
    if (isNaN(price)) {
      throw new BadRequestException(`"${value}" không phải là một con số hợp lệ cho giá sản phẩm!`);
    }

    // 2. Validation: Kiểm tra giá âm (Thu ngân không chấp nhận giá âm)
    if (price < 0) {
      throw new BadRequestException('Giá sản phẩm không được phép là số âm!');
    }

    // 3. Transformation: Làm tròn đến 2 chữ số thập phân (Chuẩn hóa tiền tệ)
    const roundedPrice = Math.round(price * 100) / 100;

    console.log(`[ProductPricePipe] Trước: ${value} -> Sau: ${roundedPrice}`);

    return roundedPrice;
  }
}
