import { CreateShipDto } from './create-ship.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateShipDto extends PartialType(CreateShipDto) {}
