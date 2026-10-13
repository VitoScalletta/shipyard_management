import { Module } from '@nestjs/common';
import { GarsonAiController } from './garson-ai.controller';
import { GarsonAiService } from './garson-ai.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { AiOrchestratorModule } from 'src/ai-orchestrator/ai-orchestrator.module';

@Module({
  imports:[TasksModule, AiOrchestratorModule],
  controllers: [GarsonAiController],
  providers: [GarsonAiService],
})
export class GarsonAiModule {}
