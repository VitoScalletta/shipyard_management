import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectPriority, ProjectStatus, ProjectType } from '../entities/project.entity';
class ShipIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CreateProjectDto {
  @IsString({ message: 'Proje adı Metin olmalıdır' })
  @IsNotEmpty({ message: 'Proje adı boş bırakılamaz' })
  name: string;

  @IsString({})
  @IsOptional()
  projectCode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectType, { message: 'Geçersiz proje tipi' })
  @IsOptional()
  type?: ProjectType;

  @IsEnum(ProjectStatus, { message: 'Geçersiz proje durumu' })
  @IsOptional()
  status?: ProjectStatus;

  @IsEnum(ProjectPriority, { message: 'Geçersiz proje önceliği' })
  @IsOptional()
  priority?: ProjectPriority;

  @IsDateString({}, { message: 'Geçersiz tarih formatı(YYYY-MM-DD)' })
  @IsOptional()
  plannedStartDate?: string;

  @IsDateString({}, { message: 'Geçersiz tarih formatı(YYYY-MM-DD)'})
  @IsOptional()
  actualStartDate?: string;

  @IsDateString({}, { message: 'Geçersiz tarih formatı(YYYY-MM-DD)' })
  @IsOptional()
  plannedDeliveryDate?: string;

  @IsDateString({}, { message: 'Geçersiz tarih formatı(YYYY-MM-DD)'})
  @IsOptional()
  actualDeliveryDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedManHours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  actualManHours?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progressPercentage?: number;

  @IsString()
  @IsOptional()
  managerId?: string;

  @ValidateNested()
  @Type(() => ShipIdDto)
  @IsOptional()
  ship?: ShipIdDto;
}
