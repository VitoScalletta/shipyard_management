import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateShipAreaDto } from './dto/create-ship-area.dto';
import { UpdateShipAreaDto } from './dto/update-ship-area.dto';
import { ShipArea } from './entities/ship-area.entity';

@Injectable()
export class ShipAreasService {
  constructor(
    @InjectRepository(ShipArea)
    private shipAreaRepository: Repository<ShipArea>,
  ) {}

  create(createShipAreaDto: CreateShipAreaDto): Promise<ShipArea> {
    const { shipId, parentAreaId, ...areaData } = createShipAreaDto;

    const newArea = this.shipAreaRepository.create({
      ...areaData,
      ship: { id: shipId },
      parentArea: parentAreaId ? { id: parentAreaId } : undefined,
    });

    return this.shipAreaRepository.save(newArea);
  }

  findAll(): Promise<ShipArea[]> {
    return this.shipAreaRepository.find({
      relations: {
        ship: true,
        parentArea: true,
        subAreas: true,
      },
    });
  }

  async findOne(id: string): Promise<ShipArea> {
    const area = await this.shipAreaRepository.findOne({
      where: { id },
      relations: {
        ship: true,
        parentArea: true,
        subAreas: true,
      },
    });

    if (!area) {
      throw new NotFoundException(`Ship Area with ID ${id} not found`);
    }

    return area;
  }

  async update(
    id: string,
    updateShipAreaDto: UpdateShipAreaDto,
  ): Promise<ShipArea> {
    const { shipId, parentAreaId, ...rest } = updateShipAreaDto;
    const updateData: DeepPartial<ShipArea> = { ...rest };

    if (shipId) {
      updateData.ship = { id: shipId };
    }

    if (parentAreaId !== undefined) {
      updateData.parentArea = parentAreaId ? { id: parentAreaId } : undefined;
    }

    await this.shipAreaRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.shipAreaRepository.delete(id);
  }
}
