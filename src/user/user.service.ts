import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { IDbCollection } from '../db/db.module';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService {
  // Inject công cụ ĐÃ KHOÁ MỤC TIÊU vào bảng 'user'
  constructor(
    @Inject('user') private readonly userDb: IDbCollection,
  ) { }

  async create(createUserDto: CreateUserDto) {
    // Chỉ cần gọi lưu, không cần truyền lại chuỗi 'user'
    return this.userDb.save(createUserDto);
  }

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.userDb.save(registerUserDto);
    return user;
  }

  async findAll() {
    // Chỉ việc gọi find(), code sạch tuyệt đối
    return this.userDb.find();
  }

  async findOne(id: string) {
    const user = await this.userDb.findById(id);
    if (!user) {
      return { message: 'Không tìm thấy User' };
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userDb.updateById(id, updateUserDto);
    if (!updatedUser) {
      return { message: 'Không tìm thấy User để cập nhật' };
    }
    return updatedUser;
  }

  async remove(id: string) {
    const isSuccess = await this.userDb.removeById(id);
    if (!isSuccess) {
      return { message: 'Không tìm thấy User để xoá' };
    }
    return { message: 'Xoá thành công' };
  }
}
