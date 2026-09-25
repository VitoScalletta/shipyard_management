import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskDependency } from './entities/task-dependency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskDependency])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
