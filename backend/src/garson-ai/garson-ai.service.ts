import { TasksService } from './../tasks/tasks.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { AiOrchestratorService } from 'src/ai-orchestrator/ai-orchestrator.service';
import { AiDatasetService } from '../ai-dataset/ai-dataset.service';
import { ProjectsService } from '../projects/projects.service';
import { ProjectStatus } from '../projects/entities/project.entity';

type ToolCall = {
  function: {
    name: string;
    arguments?: Record<string, unknown> | string;
  };
};

@Injectable()
export class GarsonAiService {
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private readonly availableTools = [
    {
      type: 'function',
      function: {
        name: 'get_delayed_tasks',
        description: 'Gecikmiş veya bitiş tarihi geçmiş görevleri listeler. Proje belirtilmezse tüm projeleri arar.',
        parameters: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'İsteğe bağlı proje UUID değeri. Kullanıcı UUID vermediyse bu alanı tamamen boş bırakın.',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_active_projects_summary',
        description: 'Aktif projelerin kısa durum özetini listeler. Kullanıcı aktif proje özeti, proje durumu veya devam eden projeleri sorunca kullanın.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_user_tasks',
        description: 'İsmi verilen personelin üzerindeki görevleri listeler.',
        parameters: {
          type: 'object',
          properties: {
            userName: { type: 'string', description: 'Görevleri aranacak personelin adı; örnek: Ahmet.' },
          },
          required: ['userName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'mark_task_completed',
        description: 'Yalnızca kullanıcı açıkça bir görevin tamamlanmasını istediğinde, geçerli görev UUID değeriyle görevi COMPLETED durumuna alır.',
        parameters: {
          type: 'object',
          properties: { taskId: { type: 'string', description: 'Tamamlanacak görevin UUID değeri.' } },
          required: ['taskId'],
        },
      },
    },
  ];

  constructor(
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
    private readonly aiOrchestratorService: AiOrchestratorService,
    private readonly aiDatasetService: AiDatasetService,
  ) {}

  async processUserMessage(userId: string, userRole: string, message: string) {
    const startTime = Date.now();
    const directResponse = await this.handleDirectRequest(message, userRole);
    if (directResponse) return directResponse;

    const messages = [
      {
        role: 'system',
        content:
          "Sen Shipyard Management sisteminin asistanı Garson AI'sın. Türkçe, kısa ve profesyonel cevap ver. " +
          'Sadece tanımlı araçlarla doğrulanabilen bilgi ver; olmayan veri, araç veya kayıt uydurma. ' +
          "Proje UUID'si yoksa get_delayed_tasks çağrısında projectId alanını boş bırak. 'all', 'tümü' veya proje adı asla UUID değildir. " +
          'Kullanıcı yalnızca görev durumunun nasıl güncelleneceğini sorarsa araç çağırma; görev UUID değerinin gerektiğini açıkla. ' +
          'Görev tamamlama isteğinde UUID yoksa araç çağırma ve UUID iste. Araç yoksa sadece bu özelliğin henüz desteklenmediğini söyle.',
      },
      { role: 'user', content: message },
    ];
    const aiMessage = await this.aiOrchestratorService.routeToChatModel(messages, this.availableTools);

    this.aiDatasetService
      .createLog({
        agentType: 'GARSON', modelName: 'Ollama', modelVersion: 'qwen2.5:7b',
        systemPrompt: messages[0].content, userPrompt: message,
        aiResponse: aiMessage.content || JSON.stringify(aiMessage.tool_calls),
        executionTimeMs: Date.now() - startTime,
      })
      .catch((err) => console.error('Dataset loglama hatası (Garson):', err));

    if (aiMessage.tool_calls?.length) return this.handleToolCalls(aiMessage.tool_calls, userRole);
    return { type: 'text', content: aiMessage.content || 'Bu talep için doğrulanabilir bir işlem gerçekleştiremedim.' };
  }

  private async handleDirectRequest(message: string, userRole: string) {
    const normalized = message.toLocaleLowerCase('tr-TR');
    if (/gecik|geçik|problemli görev/.test(normalized)) {
      const projectId = message.match(this.uuidRegex)?.[0];
      return this.handleToolCalls([{ function: { name: 'get_delayed_tasks', arguments: { projectId } } }], userRole);
    }
    if (/aktif proje|devam eden proje|proje.*özet|proje durumu/.test(normalized)) {
      return this.getActiveProjectsSummary();
    }
    if (/nasıl.*(durum|görev).*güncelle|durum.*nasıl.*güncelle/.test(normalized)) {
      return {
        type: 'text',
        content: 'Görev durumunu güncellemek için görev UUID değerini ve hedef durumu belirtin. Şu anda Garson AI yalnızca yetkili kullanıcılar için görevi tamamlandı durumuna alabilir.',
      };
    }
    return null;
  }

  private parseArguments(
    argumentsValue: ToolCall['function']['arguments'],
  ): Record<string, unknown> {
    if (!argumentsValue) return {};
    if (typeof argumentsValue === 'object') return argumentsValue;
    try {
      const parsed: unknown = JSON.parse(argumentsValue);
      return parsed && typeof parsed === 'object'
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  private async handleToolCalls(toolCalls: ToolCall[], userRole: string) {
    const results: unknown[] = [];
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const args = this.parseArguments(toolCall.function.arguments);
      try {
        if (functionName === 'get_delayed_tasks') {
          const candidateProjectId = args.projectId;
          const projectId = typeof candidateProjectId === 'string' && this.uuidRegex.test(candidateProjectId) ? candidateProjectId : undefined;
          const data = await this.tasksService.getDelayedTasks(projectId);
          results.push({ intent: functionName, status: 'success', data });
        } else if (functionName === 'get_active_projects_summary') {
          return this.getActiveProjectsSummary();
        } else if (functionName === 'get_user_tasks') {
          const userName = args.userName;
          if (typeof userName !== 'string' || !userName.trim()) {
            return { type: 'text', content: 'Görevlerini görüntülemek istediğiniz personelin adını belirtin.' };
          }
          const data = await this.tasksService.getUserTasks(userName.trim());
          results.push({ intent: functionName, status: 'success', data });
        } else if (functionName === 'mark_task_completed') {
          if (userRole !== 'ADMIN' && userRole !== 'MANAGER') throw new UnauthorizedException('Bu işlemi yapmak için yetkiniz yok.');
          const taskId = args.taskId;
          if (typeof taskId !== 'string' || !this.uuidRegex.test(taskId)) {
            return { type: 'text', content: 'Görevi tamamlamak için geçerli görev UUID değerini belirtin.' };
          }
          await this.tasksService.updateTaskStatus(taskId, TaskStatus.COMPLETED);
          results.push({ intent: functionName, status: 'success', message: `Görev ${taskId} tamamlandı olarak güncellendi.` });
        } else {
          return { type: 'text', content: 'Bu işlem için yetkim bulunmuyor.' };
        }
      } catch (error) {
        results.push({ intent: functionName, status: 'error', message: error instanceof Error ? error.message : 'İşlem tamamlanamadı.' });
      }
    }
    return results;
  }

  private async getActiveProjectsSummary() {
    const projects = await this.projectsService.findAll();
    const activeProjects = projects.filter((project) => project.status !== ProjectStatus.COMPLETED && project.status !== ProjectStatus.CANCELLED);
    return {
      type: 'project_summary',
      content: {
        activeCount: activeProjects.length,
        projects: activeProjects.map((project) => ({
          id: project.id,
          name: project.name,
          code: project.projectCode,
          status: project.status,
          plannedDeliveryDate: project.plannedDeliveryDate,
        })),
      },
    };
  }
}
