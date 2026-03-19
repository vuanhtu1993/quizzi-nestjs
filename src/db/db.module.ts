import { DynamicModule, Module, Global } from '@nestjs/common';
import { DbService } from './db.service';
import { DbModuleOptions, DB_MODULE_OPTIONS } from './db.interface';

// Token để inject cấu hình vào DbService đã được chuyển sang db.interface.ts

// Interface tuỳ chọn để TypeScript hỗ trợ gợi ý code
export interface IDbCollection<T = any> {
  find: () => Promise<T[]>;
  findById: (id: string) => Promise<T | null>;
  save: (data: Partial<T>) => Promise<T>;
  updateById: (id: string, data: Partial<T>) => Promise<T | null>;
  removeById: (id: string) => Promise<boolean>;
  findByAccountName: (accountName: string) => Promise<T | null>;
}

@Global() // Biến module tổng thành Global để DbService đi khắp nơi không cần import lại
@Module({})
export class DbModule {
  /**
   * Phương thức forRoot biến DbModule thành Dynamic Module.
   * Cung cấp Hệ thống "Điện Nước Tổng".
   */
  static forRoot(options: DbModuleOptions): DynamicModule {
    return {
      module: DbModule,
      providers: [
        DbService,
        {
          provide: DB_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [DbService],
    };
  }

  /**
   * Phương thức forFeature siêu đơn giản (không cần class Repository rườm rà).
   * Kéo Hệ thống điện nước nhánh cho từng Căn hộ.
   */
  static forFeature(collectionName: string): DynamicModule {
    return {
      module: DbModule,
      providers: [
        {
          provide: collectionName, // Lấy chính chữ 'user' làm tên Token
          useFactory: (dbService: DbService): IDbCollection => {
            // Trả về một object "vô danh" nhưng đã bọc sẵn chữ 'user' bên trong
            return {
              find: () => dbService.getCollection(collectionName),
              findById: (id: string) => dbService.findById(collectionName, id),
              findByAccountName: (accountName: string) => dbService.findByAccountName(collectionName, accountName),
              save: (data: any) => dbService.insertOne(collectionName, data),
              updateById: (id: string, data: any) => dbService.updateById(collectionName, id, data),
              removeById: (id: string) => dbService.removeById(collectionName, id),
            };
          },
          inject: [DbService], // Cần DbService để factory hoạt động
        },
      ],
      exports: [collectionName], // Xuất xưởng công cụ này cho Module gọi nó
    };
  }
}
