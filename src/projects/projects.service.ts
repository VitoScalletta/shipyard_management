import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProjectDto } from './dto/update-project.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private eventEmitter: EventEmitter2,
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
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: { ship: true },
    });
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
}
