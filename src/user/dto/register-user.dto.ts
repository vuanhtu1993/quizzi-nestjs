import { IsNotEmpty } from "class-validator";

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Tên tài khoản không được để trống' })
    accountName: string;
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string
}