import { Module } from '@nestjs/common';
import { AiDatasetService } from './ai-dataset.service';
import { AiDatasetController } from './ai-dataset.controller';

@Module({
  providers: [AiDatasetService],
  controllers: [AiDatasetController]
})
export class AiDatasetModule {}
