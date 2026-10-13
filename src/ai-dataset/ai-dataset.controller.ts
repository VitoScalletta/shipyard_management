import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { AiDatasetService } from './ai-dataset.service';
@Controller('ai-dataset')
export class AiDatasetController {
  constructor(private readonly aiDatasetService: AiDatasetService) {}

  @Post('feedback/:id')
  async submitFeedBack(
    @Param('id') logId: string,
    @Body('isHelpful') isHelpful: boolean,
    @Body('comment') comment?: string,
  ) {
    const result = await this.aiDatasetService.addFeedback(
      logId,
      isHelpful,
      comment,
    );
    return {
      success: true,
      message: 'Geri bildirim başarıyla kaydedildi.',
      data: result,
    };
  }

  @Get('export')
  async exportDataset(
    @Query('agentType') agentType: string,
    @Query('modelName') modelName: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('feedback') feedback: 'POSITIVE' | 'NEGATIVE' | 'ALL',
    @Res() res: express.Response,
  ) {
    const filters = { agentType, modelName, startDate, endDate, feedback };
    const jsonlData = await this.aiDatasetService.exportAsJsonl(filters);

    res.setHeader('Content-Type', 'application/jsonlines+json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="shipyard_ai_dataset_${Date.now()}.jsonl"`,
    );

    res.send(jsonlData);
  }
}
