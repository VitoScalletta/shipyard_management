import { IsOptional, IsPositive, IsInt, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { number } from 'joi';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @Type(() => number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['ASC','DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
