import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên tài khoản không được để trống' })
    accountName: string;
    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string
}