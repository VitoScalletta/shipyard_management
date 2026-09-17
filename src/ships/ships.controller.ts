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
import { CreateShipDto } from './dto/create-ship.dto';
import { UpdateShipDto } from './dto/update-ship.dto';

@Controller('ships')
export class ShipsController {
  constructor(private readonly shipsService: ShipsService) {}

  @Post()
  async createShip(@Body() createShipDto: CreateShipDto) {
    return await this.shipsService.create(createShipDto);
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
  updateShip(@Param('id') id: string, @Body() updateShipDto: UpdateShipDto) {
    return this.shipsService.update(id, updateShipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipsService.remove(id);
  }
}
