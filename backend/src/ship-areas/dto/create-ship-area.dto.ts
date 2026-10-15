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
import { MeasurementUnit } from 'src/common/enums/measurement-unit.enum';

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

  @IsUUID()
  @IsNotEmpty()
  shipId: string;

  @IsUUID()
  @IsOptional()
  parentAreaId?: string;

  @IsEnum(MeasurementUnit)
  @IsOptional()
  unit?: MeasurementUnit;
}
