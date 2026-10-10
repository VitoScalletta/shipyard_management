import { Controller, Get, Post, Param } from '@nestjs/common';
import { ProjectContextService } from './project-context.service';
import { AiAnalysisService } from './ai-analysis.service';

@Controller('ai-context')
export class AiContextController {
  constructor(
    private readonly projectContextService: ProjectContextService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Get('test/:projectId')
  async testContext(@Param('projectId') projectId: string) {
    const context = await this.projectContextService.buildContext(projectId);

    await this.projectContextService.saveSnapshot(projectId, context);

    return {
      message: 'AI Context başarıyla oluşturuldu ve veritabanına mühürlendi!',
      snapshotData: context,
    };
  }

  @Post('analyze/:projectId')
  async analyzeProject(@Param('projectId') projectId: string){
    const analysisResult = await this.aiAnalysisService.analyzeProject(projectId);

    return{
      message: 'Yapay Zeka analizi başarıyla tamamladı ve veritabanına kaydedildi',
      data: analysisResult,
    }
  }
}
