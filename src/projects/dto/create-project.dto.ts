import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectType } from '../entities/project.entity';
class ShipIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CreateProjectDto {
  @IsString({ message: 'Proje adı Metin olmalıdır' })
  @IsNotEmpty({ message: 'Proje adı boş bırakılamaz' })
  name: string;

  @IsEnum(ProjectType, { message: 'Geçersiz proje tipi' })
  @IsOptional()
  type?: ProjectType;

  @IsDateString({ message: 'Geçersiz tarih formatı(YYYY-MM-DD)' })
  @IsOptional()
  startDate?: Date;

  @ValidateNested()
  @Type(() => ShipIdDto)
  @IsOptional()
  ship?: ShipIdDto;
}
