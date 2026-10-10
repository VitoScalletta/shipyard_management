import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectAnalysis } from './entities/project-analysis.entity';
import { ProjectContextService } from './project-context.service';
import { ContextSnapshot } from './entities/context-snapshot.entity';
import { options } from 'joi';

@Injectable()
export class AiAnalysisService {
  private readonly OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
  private readonly MODEL_NAME = 'qwen2.5:7b';

  constructor(
    @InjectRepository(ProjectAnalysis)
    private readonly analysisRepository: Repository<ProjectAnalysis>,
    @InjectRepository(ContextSnapshot)
    private readonly snapshotRepository: Repository<ContextSnapshot>,
    private readonly contextService: ProjectContextService,
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
      const response = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.MODEL_NAME,
          prompt: prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) throw new Error('ollama servisine ulaşılamadı');

      const responseData = await response.json();
      const aiResult = JSON.parse(responseData.response);

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
        modelVersion: this.MODEL_NAME,
        executionTimeMs: executionTime,
      });
      const savedAnalysis = await this.analysisRepository.save(analysis);

      snapshot.analysisId = savedAnalysis.id;
      await this.snapshotRepository.save(snapshot);

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
}
