import { PartialType } from '@nestjs/mapped-types';
import { CreateShipAreaDto } from './create-ship-area.dto';

export class UpdateShipAreaDto extends PartialType(CreateShipAreaDto) {}
