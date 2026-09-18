import { Ship } from 'src/ships/entities/ship.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShipAreaDto } from './dto/create-ship-area.dto';
import { UpdateShipAreaDto } from './dto/update-ship-area.dto';
import { AreaType, ShipArea } from './entities/ship-area.entity';

@Injectable()
export class ShipAreasService {
  constructor(
    @InjectRepository(ShipArea)
    private shipAreaRepository: Repository<ShipArea>,
  ) {}

  create(createShipAreaDto: CreateShipAreaDto): Promise<ShipArea> {
    const newArea = this.shipAreaRepository.create({
      name: createShipAreaDto.name,
      type: createShipAreaDto.type,
      size: createShipAreaDto.size,
      unit: createShipAreaDto.unit,
      ship: { id: createShipAreaDto.shipId },
      parentArea: createShipAreaDto.parentAreaId
        ? { id: createShipAreaDto.parentAreaId }
        : null,
    });
  }

  findAll(): Promise<ShipArea[]> {
    return this.shipAreaRepository.find({
      relations: ['ship', 'parentArea', 'subAreas'],
    });
  }

  async findOne(id: string): Promise<ShipArea> {
    const area = await this.shipAreaRepository.findOne({
      where: { id },
      relations: ['ship', 'parentArea', 'subAreas'],
    });
    if (!area) throw new NotFoundException('Ship Area with ID ${id} not found');
    return area;
  }

  async update(id: string, UpdateShipAreaDto: UpdateShipAreaDto): Promise<ShipArea>{
    const updateData: any = { ...UpdateShipAreaDto};
    if(UpdateShipAreaDto.shipId){
      updateData.ship = {id : UpdateShipAreaDto.shipId};
      delete this.updateData.ShipId;
    }
    if(UpdateShipAreaDto.parentAreaId !== undefined){
      updateData.parentArea = UpdateShipAreaDto.parentAreaId ? {id : UpdateShipAreaDto.parentAreaId } : null;
    }
    await this.shipAreaRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
     await this.shipAreaRepository.delete(id);
  }
}
