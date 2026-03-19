import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbModule } from '../db/db.module';

@Module({
  // Đăng ký quyền sử dụng riêng cái kho 'user'
  imports: [DbModule.forFeature('user')],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
