/**
 * @file app.config.ts
 * @description Config object và token cho ví dụ useValue.
 *
 * ẨN DỤ: APP_CONFIG giống như tờ "hướng dẫn sử dụng" đặt sẵn trên bàn.
 * Ai cần thì lấy đọc, không ai cần phải "chế tạo" thêm bản sao nào.
 */

// Token để inject – dùng string literal làm identifier
export const APP_CONFIG = 'APP_CONFIG';

export interface AppConfig {
    appName: string;
    version: string;
    maxUploadSizeMB: number;
    environment: string;
}

// Object thuần – NestJS sẽ inject đúng cái này, không new thêm gì cả
export const appConfig: AppConfig = {
    appName: 'Quizzi',
    version: '1.0.0',
    maxUploadSizeMB: 50,
    environment: process.env.NODE_ENV ?? 'development',
};
