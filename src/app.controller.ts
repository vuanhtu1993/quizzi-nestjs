import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginGuard } from './login/login.guard';

/**
 * @file app.controller.ts
 * @description Controller expose 4 endpoints để demo từng loại provider.
 *
 * Mỗi route GET tương ứng với một cách tạo provider:
 *   GET /              → useClass  (mặc định, chứng minh app vẫn chạy)
 *   GET /demo/use-class    → useClass  (EmailService: Real vs Mock)
 *   GET /demo/use-value    → useValue  (AppConfig object tĩnh)
 *   GET /demo/use-factory  → useFactory (DatabaseConnection khởi tạo async)
 *   GET /demo/use-existing → useExisting (Logger alias, cùng 1 instance)
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /** useClass: swap implementation tùy môi trường */
  @Get()
  @UseGuards(LoginGuard)
  getHello(): string {
    return this.appService.getHello();
  }

  /** useClass: EmailService – Real hoặc Mock tùy biến NODE_ENV trong AppModule */
  @Get('demo/use-class')
  demoUseClass(): string {
    return this.appService.demoUseClass();
  }

  /** useValue: inject AppConfig object đã tạo sẵn, không cần "new" */
  @Get('demo/use-value')
  demoUseValue(): string {
    return this.appService.demoUseValue();
  }

  /** useFactory: DatabaseConnection được khởi tạo async, inject vào sau khi ready */
  @Get('demo/use-factory')
  demoUseFactory(): string {
    return this.appService.demoUseFactory();
  }

  /** useExisting: NOTIFICATION_LOGGER là alias của APP_LOGGER – cùng 1 Singleton instance */
  @Get('demo/use-existing')
  demoUseExisting(): string {
    return this.appService.demoUseExisting();
  }
}
