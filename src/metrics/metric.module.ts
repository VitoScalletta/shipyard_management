import { Global, Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true, 
      },
    }),
  ],
  providers: [
    MetricsService,
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP isteklerinin gecikme süreleri (saniye)',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    }),
    makeGaugeProvider({
      name: 'db_connection_pool_size',
      help: 'TypeORM PostgreSQL bağlantı havuzu durumu (total, idle, waiting)',
      labelNames: ['state'],
    }),
    makeHistogramProvider({
      name: 'ai_inference_duration_seconds',
      help: 'Qwen AI modellerinin yanıt üretme süresi (saniye)',
      labelNames: ['model', 'task_type', 'status'],
      buckets: [0.5, 1, 2, 5, 10, 20, 30, 60],
    }),
    makeCounterProvider({
      name: 'ai_inference_requests_total',
      help: 'Toplam AI istek sayısı ve başarı/hata durumu',
      labelNames: ['model', 'task_type', 'status'],
    }),
    makeCounterProvider({
      name: 'ai_prompt_characters_total',
      help: 'Yapay zekaya gönderilen toplam prompt karakter boyutu',
      labelNames: ['model', 'task_type'],
    }),
    makeCounterProvider({
      name: 'ai_tokens_total',
      help: 'Harcanan toplam AI token miktarı (prompt ve completion)',
      labelNames: ['model', 'type'],
    }),
    makeCounterProvider({
      name: 'ai_human_feedback_total',
      help: 'Kullanıcıların AI analizlerine verdiği geri bildirimler (positive/negative)',
      labelNames: ['rating', 'model'],
    }),
  ],
  exports: [MetricsService, PrometheusModule],
})
export class MetricsModule {}