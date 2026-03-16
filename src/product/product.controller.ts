import { Controller, Get, Query } from '@nestjs/common';
import { ProductPricePipe } from '../common/pipes/product-price.pipe';

/**
 * @file product.controller.ts
 * @description Controller xử lý các logic liên quan đến sản phẩm.
 */
@Controller('product')
export class ProductController {

  /**
   * Endpoint lọc sản phẩm theo giá.
   * Minh họa việc sử dụng Pipe để xử lý Query Parameter.
   * 
   * @param price Giá tối thiểu (sẽ được ProductPricePipe validate và transform)
   */
  @Get('filter')
  filterByPrice(@Query('minPrice', ProductPricePipe) price: number) {
    return {
      message: `Đang tìm kiếm các sản phẩm có giá từ ${price} trở lên.`,
      appliedFilter: {
        minPrice: price,
        typeOfPrice: typeof price,
      },
      hint: 'Hãy thử nhập ?minPrice=99.99 hoặc ?minPrice=-10 để thấy Pipe hoạt động!'
    };
  }
}
