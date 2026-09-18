import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShipAreasService } from './ship-areas.service';
import { CreateShipAreaDto } from './dto/create-ship-area.dto';
import { UpdateShipAreaDto } from './dto/update-ship-area.dto';

@Controller('ship-areas')
export class ShipAreasController {
  constructor(private readonly shipAreasService: ShipAreasService) {}

  @Post()
  create(@Body() createShipAreaDto: CreateShipAreaDto) {
    return this.shipAreasService.create(createShipAreaDto);
  }

  @Get()
  findAll() {
    return this.shipAreasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipAreasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShipAreaDto: UpdateShipAreaDto) {
    return this.shipAreasService.update(+id, updateShipAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipAreasService.remove(+id);
  }
}
