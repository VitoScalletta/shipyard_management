import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'geçerli bir email adresi giriniz' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre boş bırakılamaz' })
  password: string;
}
