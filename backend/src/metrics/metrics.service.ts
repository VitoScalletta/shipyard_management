import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';
import { DataSource } from 'typeorm';

@Injectable()
export class MetricsService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    @InjectMetric('http_request_duration_seconds')
    public readonly httpRequestDuration: Histogram<string>,

    @InjectMetric('db_connection_pool_size')
    public readonly dbPoolGauge: Gauge<string>,

    @InjectMetric('ai_inference_duration_seconds')
    public readonly aiDuration: Histogram<string>,

    @InjectMetric('ai_inference_requests_total')
    public readonly aiRequestsTotal: Counter<string>,

    @InjectMetric('ai_prompt_characters_total')
    public readonly aiPromptCharactersTotal: Counter<string>,

    @InjectMetric('ai_tokens_total')
    public readonly aiTokensTotal: Counter<string>,

    @InjectMetric('ai_human_feedback_total')
    public readonly aiFeedbackTotal: Counter<string>,
  ) {}

  onModuleInit() {
    setInterval(() => {
      try {
        const driver = (this.dataSource.driver as any).master;
        if (driver) {
          this.dbPoolGauge.set({ state: 'total' }, driver.totalCount || 0);
          this.dbPoolGauge.set({ state: 'idle' }, driver.idleCount || 0);
          this.dbPoolGauge.set({ state: 'waiting' }, driver.waitingCount || 0);
        }
      } catch {}
    }, 10000).unref();
  }

  recordAiMetrics(params: {
    model: string,
    taskType: 'chat' | 'analyst';
    status: 'success' | 'timeout' | 'error';
    durationSeconds: number;
    promptLength: number;
    promptTokens?: number;
    completionTokens?: number;
  }){
    const{
        model,
      taskType,
      status,
      durationSeconds,
      promptLength,
      promptTokens = 0,
      completionTokens = 0,
    } = params;

    this.aiRequestsTotal.inc({ model, task_type: taskType, status });

    this.aiDuration.observe({ model, task_type: taskType, status }, durationSeconds);

    this.aiPromptCharactersTotal.inc(
      { model, task_type: taskType },
      promptLength,
    );

    const estimatedPromptTokens = promptTokens || Math.ceil(promptLength / 4);
    this.aiTokensTotal.inc({ model, type: 'prompt' }, estimatedPromptTokens);

    if (completionTokens > 0) {
      this.aiTokensTotal.inc({ model, type: 'completion' }, completionTokens);
    }
  }
  recordHumanFeedback(rating: 'positive' | 'negative', model = 'qwen2.5') {
    this.aiFeedbackTotal.inc({ rating, model });
  }
}
