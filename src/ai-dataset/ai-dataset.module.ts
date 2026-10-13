import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiDatasetService } from './ai-dataset.service';
import { AiDatasetController } from './ai-dataset.controller';
import { AiTrainingDataset } from './entities/ai-training-dataset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiTrainingDataset])],
  controllers: [AiDatasetController],
  providers: [AiDatasetService],
  exports: [AiDatasetService],
})
export class AiDatasetModule {}
