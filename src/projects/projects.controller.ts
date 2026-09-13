import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() projectData: Partial<Project>) {
    return this.projectsService.create(projectData);
  }

  @Get()
  findAllProjects() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findProjectById(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  updateProject(@Param('id') id: string, @Body() updateData: Partial<Project>) {
    return this.projectsService.update(id, updateData);
  }

  @Delete(':id')
  removeProject(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
