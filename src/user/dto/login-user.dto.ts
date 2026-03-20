import { IsString, IsNotEmpty } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    accountName: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
