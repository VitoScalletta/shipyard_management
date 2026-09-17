import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ShipStatus } from '../entities/ship.entity';

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

  @IsString()
  @IsOptional()
  shipClass?: string;

  @IsEnum(ShipStatus)
  @IsOptional()
  status?: ShipStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  loa?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  beam?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  draft?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  displacement?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  grossTonnage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  netTonnage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deckArea?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  enclosedArea?: number;
}
