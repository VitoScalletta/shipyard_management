import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateShipDto {
  @IsString({ message: 'Gemi adı Metin olmalıdır' })
  @IsNotEmpty({ message: 'Gemi adı boş bırakılamaz' })
  @Length(2, 150, { message: 'Gemi adı 2 ile 150 karakter arasında olmalıdır' })
  name: string;

  @IsString()
  @IsOptional()
  @Length(7, 20)
  imoNumber?: string;

  @IsString()
  @IsOptional()
  shipType?: string;
}
