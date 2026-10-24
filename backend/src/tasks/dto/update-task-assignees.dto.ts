import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class UpdateTaskAssigneesDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  userIds: string[];
}
