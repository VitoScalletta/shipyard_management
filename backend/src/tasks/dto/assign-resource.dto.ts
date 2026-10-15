import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class AssignResourceDto {
  @IsUUID()
  resourceId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
