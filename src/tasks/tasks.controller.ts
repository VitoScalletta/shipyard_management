import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskDependencyDto } from './dto/create-task-dependency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { TaskStatus } from './enums/task-status.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.ENGINEER)
  addDependency(@Body() createDependencyDto: CreateTaskDependencyDto) {
    return this.taskService.addDependency(createDependencyDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.taskService.updateTaskStatus(id, status);
  }

  @Get()
  findAll(){
    return this.taskService.findAll();
  }
}
