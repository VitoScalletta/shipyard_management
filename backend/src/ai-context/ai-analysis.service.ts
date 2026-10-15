import { AiOrchestratorService } from './../ai-orchestrator/ai-orchestrator.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectAnalysis } from './entities/project-analysis.entity';
import { ProjectContextService } from './project-context.service';
import { ContextSnapshot } from './entities/context-snapshot.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiDatasetService } from '../ai-dataset/ai-dataset.service';

@Injectable()
export class AiAnalysisService {
  constructor(
    @InjectRepository(ProjectAnalysis)
    private readonly analysisRepository: Repository<ProjectAnalysis>,
    @InjectRepository(ContextSnapshot)
    private readonly snapshotRepository: Repository<ContextSnapshot>,
    private readonly contextService: ProjectContextService,
    private readonly aiOrchestratorService: AiOrchestratorService,
    private readonly aiDatasetService: AiDatasetService,
  ) {}

  async analyzeProject(projectId: string): Promise<ProjectAnalysis> {
    const startTime = Date.now();

    const contextData = await this.contextService.buildContext(projectId);
    const snapshot = await this.contextService.saveSnapshot(
      projectId,
      contextData,
    );

    const prompt = this.buildPrompt(contextData);

    try {
      const messages = [{ role: 'user', content: prompt }];
      const aiMessage =
        await this.aiOrchestratorService.routeToAnalystModel(messages);
      const cleanJsonString = aiMessage.content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const aiResult = JSON.parse(cleanJsonString);

      const executionTime = Date.now() - startTime;

      const analysis = this.analysisRepository.create({
        projectId: projectId,
        snapshotId: snapshot.id,
        overallRiskLevel: aiResult.riskLevel || 'UNKNOWN',
        projectStatus: aiResult.projectStatus || '',
        risks: aiResult.risks || [],
        recommendations: aiResult.recommendations || [],
        criticalPathAnalysis: aiResult.criticalPathAnalysis || {},
        model: 'Ollama',
        modelVersion: 'qwen2.5:7b',
        executionTimeMs: executionTime,
      });

      const savedAnalysis = await this.analysisRepository.save(analysis);

      snapshot.analysisId = savedAnalysis.id;
      await this.snapshotRepository.save(snapshot);
      this.aiDatasetService
        .createLog({
          agentType: 'ANALYST',
          modelName: 'Ollama',
          modelVersion: 'qwen2.5:7b',
          systemPrompt: 'Sen üst düzey bir Tersane Proje Analistisin...',
          userPrompt: prompt,
          shipyardContext: contextData,
          aiResponse: cleanJsonString,
          executionTimeMs: executionTime,
        })
        .catch((err) =>
          console.error('Dataset loglama hatası (Analist):', err),
        );
      return savedAnalysis;
    } catch (error) {
      console.error('AI Analiz Hatası:', error);
      throw new InternalServerErrorException(
        'Proje analiz edilirken AI servisinde bir hata oluştu.',
      );
    }
  }
  private buildPrompt(context: any): string {
    return `
      Sen üst düzey bir Tersane Proje Analistisin. Görevin, aşağıda verilen JSON formatındaki proje verilerini incelemek ve tespit ettiğin riskleri, darboğazları ve çözüm önerilerini SADECE JSON formatında döndürmektir.

      ANALİZ EDİLECEK VERİ:
      ${JSON.stringify(context, null, 2)}

      ZORUNLU JSON ÇIKTI ŞEMASI (Başka hiçbir metin veya markdown ekleme):
      {
        "riskLevel": "HIGH | MEDIUM | LOW",
        "projectStatus": "Projenin genel gidişatını özetleyen 2-3 cümle.",
        "estimatedCompletionRisk": "Proje zamanında bitecek mi? Gecikme riski var mı?",
        "criticalPathAnalysis": {
          "status": "Darboğaz analizi özeti",
          "affectedTasks": ["Görev ID veya İsimleri"]
        },
        "risks": [
          {
            "type": "WORKFORCE | SCHEDULE | RESOURCE | DEPENDENCY",
            "title": "Kısa risk başlığı",
            "description": "Detaylı açıklama",
            "severity": "HIGH | MEDIUM | LOW"
          }
        ],
        "recommendations": [
          {
            "title": "Aksiyon başlığı",
            "description": "Nasıl çözüleceği",
            "priority": "HIGH | MEDIUM | LOW"
          }
        ]
      }
    `;
  }

  @OnEvent('project.created')
  @OnEvent('task.updated')
  async handleTaskUpdatedEvent(payload: { projectId: string }) {
    console.log(
      `[Event Tetiklendi] Proje ${payload.projectId} için arka plan analizi başlatılıyor`,
    );
    try {
      await this.analyzeProject(payload.projectId);
      console.log(`[Event Başarılı] Arka plan analizi tamamlandı.`);
    } catch (error) {
      console.error(`[Event Hatası] Otomatik analiz başarısızdır : `, error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleScheduledAnalysis() {
    console.log(
      '[Sistem] Gece vardiyası: tüm aktif projeler için AI analizi başlatıldı',
    );
  }
}
