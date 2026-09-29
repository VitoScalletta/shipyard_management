import { Module } from '@nestjs/common';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskDependency } from 'src/tasks/entities/task-dependency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskDependency])],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
