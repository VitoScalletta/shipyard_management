import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { ResourceStatus } from './enums/resource-status.enum';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  async create(createResourceDto: Partial<Resource>): Promise<Resource> {
    const newResource = this.resourceRepository.create(createResourceDto);
    return await this.resourceRepository.save(newResource);
  }

  async findAll(status?: ResourceStatus): Promise<Resource[]> {
    const where = status ? { status } : {};
    return await this.resourceRepository.find({ where });
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return resource;
  }

  async update(id: string, updateData: Partial<Resource>): Promise<Resource> {
    const resource = await this.findOne(id);
    Object.assign(resource, updateData);
    return await this.resourceRepository.save(resource);
  }

  async remove(id: string): Promise<void> {
    const resource = await this.findOne(id);
    await this.resourceRepository.remove(resource);
  }
}
