import { Body, Controller, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() projectData: Partial<Project>) {
    return await this.projectsService.create(projectData);
  }
}
