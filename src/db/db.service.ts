import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DB_MODULE_OPTIONS } from './db.interface';
import type { DbModuleOptions } from './db.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * DbService đóng vai trò như một "Dumb Database".
 * Nghĩa là nó không dùng DB thật (SQL/NoSQL) mà chỉ đọc/ghi file JSON.
 * Rất phù hợp cho mục đích Mock, làm quen logic, chưa cần tốn setup DB phức tạp.
 */
@Injectable()
export class DbService implements OnModuleInit {
  // @Inject(KEY): Ta đến "kho" của NestJS, tìm xem cái gì mang biển tên là DB_MODULE_OPTIONS
  // thì nhét vào biến options này giúp. Đây chính là giá trị ta cấu hình ở app.module.ts
  constructor(@Inject(DB_MODULE_OPTIONS) private readonly options: DbModuleOptions) { }

  /**
   * onModuleInit là 1 lifecycle hook của NestJS.
   * Hàm này sẽ tự động chạy ngay sau khi Module vừa được khởi tạo xong.
   * Ở đây ta dùng nó để kiểm tra xem thư mục lưu data đã có chưa, nếu chưa thì tạo ra.
   */
  async onModuleInit() {
    try {
      // access() kiểm tra sự tồn tại của file/thư mục, nếu không có sẽ quăng lỗi
      await fs.access(this.options.dataFolderPath);
    } catch {
      // Bắt lỗi (tức là chưa có folder), tiến hành tạo folder mới
      // recursive: true giúp tạo luôn các folder cha nếu chưa tồn tại
      await fs.mkdir(this.options.dataFolderPath, { recursive: true });
    }
  }

  /**
   * Hàm nội bộ sinh ra đường dẫn đầy đủ đến file JSON kết hợp tên thư mục.
   * Ví dụ: getFilePath('user') -> '/path/to/data/user.json'
   */
  private getFilePath(collectionName: string): string {
    return path.join(this.options.dataFolderPath, `${collectionName}.json`);
  }

  /**
   * Đọc toàn bộ danh sách dữ liệu từ 1 file JSON (collection).
   * Giống như lệnh db.collection.find() trong MongoDB hay SELECT * trong SQL.
   */
  async getCollection(collectionName: string): Promise<any[]> {
    const filePath = this.getFilePath(collectionName);
    try {
      // Đọc toàn bộ nội dung file dưới dạng chuỗi UTF-8
      const data = await fs.readFile(filePath, 'utf-8');
      // Biến chuỗi JSON thành Mảng object của Javascript
      return JSON.parse(data);
    } catch {
      // Nếu file không tồn tại (chưa có data), coi như bảng rỗng
      return [];
    }
  }

  /**
   * Cập nhật toàn bộ file JSON.
   */
  private async saveCollection(collectionName: string, data: any[]): Promise<void> {
    const filePath = this.getFilePath(collectionName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * CREATE - Thêm mới 1 item
   */
  async insertOne(collectionName: string, item: any): Promise<any> {
    const data = await this.getCollection(collectionName);
    if (!item.id) item.id = Date.now().toString(); // Tạo ID chuỗi
    data.push(item);
    await this.saveCollection(collectionName, data);
    return item;
  }

  /**
   * READ - Tìm 1 item theo ID
   */
  async findById(collectionName: string, id: string): Promise<any> {
    const data = await this.getCollection(collectionName);
    return data.find(item => item.id === id) || null;
  }

  /**
   * READ - Tìm 1 item theo accountName
   */
  async findByAccountName(collectionName: string, accountName: string): Promise<any> {
    const data = await this.getCollection(collectionName);
    return data.find(item => item.accountName === accountName) || null;
  }

  /**
   * UPDATE - Cập nhật 1 item theo ID
   */
  async updateById(collectionName: string, id: string, updateData: any): Promise<any> {
    const data = await this.getCollection(collectionName);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null; // Không tìm thấy

    // Thay đổi data cũ bằng data mới 
    data[index] = { ...data[index], ...updateData };
    await this.saveCollection(collectionName, data);
    return data[index];
  }

  /**
   * DELETE - Xoá 1 item theo ID
   */
  async removeById(collectionName: string, id: string): Promise<boolean> {
    const data = await this.getCollection(collectionName);
    const newData = data.filter(item => item.id !== id);

    // Nếu độ dài mảng không đổi tức là không có gì bị xoá
    if (newData.length === data.length) return false;

    await this.saveCollection(collectionName, newData);
    return true;
  }
}
