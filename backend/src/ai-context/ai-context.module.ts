import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectContextService } from './project-context.service';
import { ContextSnapshot } from './entities/context-snapshot.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskDependency } from '../tasks/entities/task-dependency.entity';
import { Employee } from '../workforce/entities/employee.entity';
import { Resource } from '../resources/entities/resource.entity';
import { AiContextController } from './ai-context.controller';
import { ProjectAnalysis } from './entities/project-analysis.entity';
import { AiAnalysisService } from './ai-analysis.service';
import { AiOrchestratorModule } from '../ai-orchestrator/ai-orchestrator.module';
import { AiDatasetModule } from '../ai-dataset/ai-dataset.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContextSnapshot,
      ProjectAnalysis,
      Project,
      Task,
      TaskDependency,
      Employee,
      Resource,
    ]),
    AiOrchestratorModule,
    AiDatasetModule,
  ],
  controllers: [AiContextController],
  providers: [ProjectContextService, AiAnalysisService],
  exports: [ProjectContextService, AiAnalysisService],
})
export class AiContextModule {}
