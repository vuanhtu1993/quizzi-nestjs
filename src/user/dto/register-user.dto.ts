import { IsNotEmpty } from "class-validator";

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Tên tài khoản không được để trống' })
    accountName: string;
    password: string
}