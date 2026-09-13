import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { ShipsService } from './ships.service';
import { Ship } from './entities/ship.entity';

@Controller('ships')
export class ShipsController {
  constructor(private readonly shipsService: ShipsService) {}

  @Post()
  async createShip(@Body() shipData: Partial<Ship>) {
    return await this.shipsService.create(shipData);
  }

  @Get()
  findAllShips() {
    return this.shipsService.findAll();
  }

  @Get(':id')
  async findShipById(@Param('id') id: string) {
    return await this.shipsService.findOne(id);
  }

  @Patch(':id')
  updateShip(@Param('id') id: string, @Body() updateData: Partial<Ship>) {
    return this.shipsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipsService.remove(id);
  }
}
