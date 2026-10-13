import { Module } from '@nestjs/common';
import { GarsonAiController } from './garson-ai.controller';
import { GarsonAiService } from './garson-ai.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { AiOrchestratorModule } from 'src/ai-orchestrator/ai-orchestrator.module';
import { AiDatasetModule } from '../ai-dataset/ai-dataset.module';

@Module({
  imports:[TasksModule, AiOrchestratorModule,AiDatasetModule],
  controllers: [GarsonAiController],
  providers: [GarsonAiService],
})
export class GarsonAiModule {}
