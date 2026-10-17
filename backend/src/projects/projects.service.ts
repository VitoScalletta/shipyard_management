import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProjectDto } from './dto/update-project.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateProjectDto } from './dto/create-project.dto';
import { ShipArea } from '../ship-areas/entities/ship-area.entity';

const LEGACY_PROJECT_CODES: Record<string, string> = {
  'PRJ-084': 'BLD-2026-08',
  'PRJ-091': 'BLD-2026-12',
  'PRJ-095': 'MNT-2026-03',
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private eventEmitter: EventEmitter2,
    @InjectRepository(ShipArea)
    private readonly shipAreaRepository: Repository<ShipArea>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    const savedProject = await this.projectRepository.save(project);

    this.eventEmitter.emit('project.created', { projectId: savedProject.id });

    return savedProject;
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: { ship: true } });
  }

  async findOne(id: string): Promise<Project> {
    const relations = { ship: true };
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      );
    let project: Project | null = null;

    if (isUuid) {
      project = await this.projectRepository.findOne({
        where: { id },
        relations,
      });
    } else {
      project = await this.projectRepository.findOne({
        where: { projectCode: LEGACY_PROJECT_CODES[id] ?? id },
        relations,
      });
    }

    if (!project && !isUuid) {
      project = await this.projectRepository.findOne({
        where: { id },
        relations,
      });
    }

    if (!project) {
      throw new NotFoundException('Proje bulunamadı.');
    }
    return project;
  }

  async update(id: string, @Body() updateProjectDto: UpdateProjectDto) {
    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Proje bulunamadı.');
    }
  }
  async findZonesByProjectId(projectId: string): Promise<ShipArea[]> {
    const project = await this.findOne(projectId);
    if (!project.ship) {
      return [];
    }
    return this.shipAreaRepository.find({
      where: { ship: { id: project.ship.id } },
      relations: { parentArea: true },
      order: { id: 'ASC' },
    });
  }
}
