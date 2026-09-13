import { Injectable, NotFoundException } from '@nestjs/common';
import { Ship } from './entities/ship.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from 'node_modules/@nestjs/typeorm/dist/common/typeorm.decorators';

@Injectable()
export class ShipsService {
  constructor(
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
  ) {}

  async create(shipData: Partial<Ship>): Promise<Ship> {
    const newShip = this.shipRepository.create(shipData);
    return this.shipRepository.save(newShip);
  }

  async findAll(): Promise<Ship[]> {
    return this.shipRepository.find({ relations: { projects: true } });
  }

  async findOne(id: string): Promise<Ship> {
    const ship = await this.shipRepository.findOne({
      where: { id },
      relations: { projects: true },
    });
    if (!ship) {
      throw new NotFoundException(`ID'si ${id} olan gemi bulunamadı.`);
    }
    return ship;
  }

  async update(id: string, updateData: Partial<Ship>): Promise<Ship> {
    await this.shipRepository.update(id, updateData);
    return this.findOne(String(id));
  }

  async remove(id: string): Promise<void> {
    const result = await this.shipRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ID'si ${id} olan gemi bulunamadı.`);
    }
  }
}
