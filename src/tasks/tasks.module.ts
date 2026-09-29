import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { TaskResource } from './entities/task-resource.entity';
import { Resource } from 'src/resources/entities/resource.entity';
import { Team } from 'src/workforce/entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskDependency,
      TaskResource,
      Resource,
      Team,
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
