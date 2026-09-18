import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { AreaType } from '../entities/ship-area.entity';

export class CreateShipAreaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AreaType)
  @IsOptional()
  type?: AreaType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsUUID()
  @IsNotEmpty()
  shipId: string;

  @IsUUID()
  @IsOptional()
  parentAreaId?: string;
}
