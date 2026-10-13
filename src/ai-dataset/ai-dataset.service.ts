import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AiTrainingDataset } from './entities/ai-training-dataset.entity';
import { Repository } from 'typeorm';
import { metadata } from 'reflect-metadata/no-conflict';

@Injectable()
export class AiDatasetService {
  constructor(
    @InjectRepository(AiTrainingDataset)
    private readonly datasetRepository: Repository<AiTrainingDataset>,
  ) {}

       async createLog(data: Partial<AiTrainingDataset>): Promise<AiTrainingDataset> {
    const log = this.datasetRepository.create(data);
    return this.datasetRepository.save(log);
  }
  async addFeedback(logId: string, isHelpful: boolean, comment?: string) {
    const log = await this.datasetRepository.findOne({ where: { id: logId } });

    if (!log) {
      throw new NotFoundException(
        'Değerlendirilecek yapay zeka yanıtı bulunamadı',
      );
    }

    log.humanFeedback = isHelpful;
    if (comment) {
      log.feedbackComment = comment;
    }

    return this.datasetRepository.save(log);
  }

  async exportAsJsonl(filters: {
    agentType?: string;
    modelName?: string;
    startDate?: string;
    endDate?: string;
    feedback?: 'POSITIVE' | 'NEGATIVE' | 'ALL';
  }): Promise<String> {
    const query = this.datasetRepository.createQueryBuilder('dataset');

    if (filters.agentType) {
      query.andWhere('dataset.agentType = :agentType', {
        agentType: filters.agentType,
      });
    }

    if (filters.modelName) {
      query.andWhere('dataset.modelName = :modelName', {
        modelName: filters.modelName,
      });
    }

    if (filters.startDate) {
      query.andWhere('dataset.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('dataset.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.feedback === 'POSITIVE') {
      query.andWhere('dataset.humanFeedback = true');
    } else if (filters.feedback === 'NEGATIVE') {
      query.andWhere('dataset.humanFeedback = false');
    }

    const datasets = await query.getMany();

    let jsonlString = '';
    for (const data of datasets) {
      const fineTuningObject = {
        messages: [
          {
            role: 'system',
            content: data.systemPrompt || 'Sen bir tersane asistanısın.',
          },
          { role: 'user', content: data.userPrompt },
          { role: 'assistant', content: data.aiResponse },
        ],
        metadata: {
          agent: data.agentType,
          context: data.shipyardContext,
          isHelpful: data.humanFeedback,
        },
      };

      jsonlString += JSON.stringify(fineTuningObject) + '\n';
    }
    return jsonlString;
  }
}
