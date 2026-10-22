import {
  Injectable,
  InternalServerErrorException,
  Optional,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from 'src/metrics/metrics.service';
@Injectable()
export class AiOrchestratorService {
  constructor(
    private configService: ConfigService,
    @Optional() private readonly metricsService?: MetricsService,
  ){
    const baseUrl = this.configService.get<string>('OLLAMA_URL') || 'http://127.0.0.1:11434';
    this.OLLAMA_URL = `${baseUrl}/api/chat`;
  }

  private readonly OLLAMA_URL: string;

  private readonly CHAT_MODEL = 'qwen2.5:7b';
  private readonly ANALYST_MODEL = 'qwen2.5:7b';

  async routeToChatModel(messages: any[], tools?: any[]) {
    return this.executeWithRetryAndTimeout(
      {
        model: this.CHAT_MODEL,
        messages,
        tools,
        stream: false,
      },
      {
        timeoutMs: 150000, //15sn chatin cevap vermesi için
        maxRetries: 2,
      },
    );
  }

  async routeToAnalystModel(messages: any[]) {
    return this.executeWithRetryAndTimeout(
      {
        model: this.ANALYST_MODEL,
        messages,
        stream: false,
      },
      {
        timeoutMs: 600000,//analistin cevap vermesi için gereken süre
        maxRetries: 3,
      },
    );
  }

  private async executeWithRetryAndTimeout(
    payload: any,
    config: { timeoutMs: number; maxRetries: number },
  ) {
    let attempt = 0;
    while (attempt < config.maxRetries) {
      attempt++;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        console.log(
          `[AI Orchestrator] İstek atılıyor... Model: ${payload.model} | deneme: ${attempt}`,
        );

        const response = await fetch(this.OLLAMA_URL, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ollama API hatası: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message;
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(
          `[AI Orchestrator] Deneme ${attempt} başarısız oldu. Hata: ${error.name || error.message}`,
        );
        if (attempt >= config.maxRetries) {
          if (error.name === 'AbortError') {
            throw new RequestTimeoutException(
              `Yapay zeka modeli belirlenen sürede (${config.timeoutMs}ms) yanıt veremedi.`,
            );
          }
          throw new InternalServerErrorException(
            'Yapay zeka motoruna ulaşılamıyor.',
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}
