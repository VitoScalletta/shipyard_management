import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ProjectContextService } from './project-context.service';
import { AiAnalysisService } from './ai-analysis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-context')
@UseGuards(JwtAuthGuard)
export class AiContextController {
  constructor(
    private readonly projectContextService: ProjectContextService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Get('projects/:projectId/latest')
  async getLatestAnalysis(@Param('projectId') projectId: string) {
    return this.aiAnalysisService.getLatestAnalysis(projectId);
  }

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
  async analyzeProject(@Param('projectId') projectId: string) {
    const analysisResult = await this.aiAnalysisService.analyzeProject(projectId);

    return{
      message: 'Yapay Zeka analizi başarıyla tamamladı ve veritabanına kaydedildi',
      data: analysisResult,
    }
  }
}
