import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { DependencyType } from '../enums/dependency-type.enum';

export class CreateTaskDependencyDto {
  @IsUUID()
  @IsNotEmpty()
  predecessorId: string;

  @IsUUID()
  @IsNotEmpty()
  successorId: string;

  @IsEnum(DependencyType)
  @IsOptional()
  type?: DependencyType
}
