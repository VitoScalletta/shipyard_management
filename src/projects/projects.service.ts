import { Injectable } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { InjectRepository } from 'node_modules/@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(projectData: Partial<Project>): Promise<Project> {
    const newProject = this.projectRepository.create(projectData);
    return this.projectRepository.save(newProject);
  }
}
