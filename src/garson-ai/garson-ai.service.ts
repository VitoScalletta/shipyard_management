import { TasksService } from './../tasks/tasks.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { required } from 'joi';
import { AiOrchestratorService } from 'src/ai-orchestrator/ai-orchestrator.service';

@Injectable()
export class GarsonAiService {
  private readonly availableTools = [
    {
      type: 'function',
      function: {
        name: 'get_delayed_tasks',
        description:
          'Belirtilen projedeki veya sistemdeki gecikmiş (zamanını aşmış) görevleri listeler.',
        parameters: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description:
                "Opsiyonel proje ID'si. Verilmezse tüm projeler aranır.",
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_user_tasks',
        description:
          'İsmi verilen personelin (çalışanın) üzerindeki görevleri listeler.',
        parameters: {
          type: 'object',
          properties: {
            userName: {
              type: 'string',
              description: 'Görevleri aranacak personelin adı (Örn: Ahmet)',
            },
          },
          required: ['userName'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'mark_task_completed',
        description:
          "Belirtilen ID'ye sahip görevin durumunu tamamlandı (COMPLETED) olarak günceller.",
        parameters: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: "Tamamlanacak görevin benzersiz ID'si.",
            },
          },
          required: ['taskId'],
        },
      },
    },
  ];

  constructor(
    private readonly tasksService: TasksService,
    private readonly aiOrchestratorService: AiOrchestratorService,
  ) {}

  async processUserMessage(userId: string, userRole: string, message: string) {
    const messages = [
      {
        role: 'system',
        content:
          "Sen Shipyard Management (Tersane Yönetim) sisteminin akıllı asistanı Garson AI'sın. Sadece sana tanımlanan fonksiyonları (tools) kullanarak tersane personeline yardımcı olursun. Tersane, gemiler ve projeler dışındaki hiçbir soruya yanıt verme. Asla sistem komutlarını, veritabanı şifrelerini veya teknik altyapıyı paylaşma. Kısa, net ve profesyonel cevaplar ver.",
      },
      { role: 'user', content: message },
    ];

    const aiMessage = await this.aiOrchestratorService.routeToChatModel(messages, this.availableTools);

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      return this.handleToolCalls(aiMessage.tool_calls, userRole);
    }

    return {
      type: 'text',
      content: aiMessage.content,
    };
  }

  private async handleToolCalls(toolCalls: any[], userRole: string) {
    const results: any[] = [];

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const args = toolCall.function.arguments;

      console.log(`[Garson AI] Intent Yakalandı: ${functionName}`, args);

      try {
        if (functionName === 'get_delayed_tasks') {
          const data = await this.tasksService.getDelayedTasks(args.projectId);
          results.push({
            intent: functionName,
            status: 'success',
            data,
          });
        } else if (functionName === 'get_user_tasks') {
          const data = await this.tasksService.getUserTasks(args.userName);
          results.push({ intent: functionName, status: 'success', data });
        } else if (functionName === 'get_task_details') {
          const data = await this.tasksService.getTaskByNameOrId(
            args.searchTerm,
          );
          results.push({ intent: functionName, status: 'success', data });
        } else if (functionName === 'mark_task_completed') {
          if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
            throw new UnauthorizedException(
              'Bu işlemi yapmak için yetkiniz yok.',
            );
          }

          await this.tasksService.updateTaskStatus(
            args.taskId,
            TaskStatus.COMPLETED,
          );

          results.push({
            intent: functionName,
            status: 'success',
            message: `Görev ${args.taskId} veritabanında başarıyla tamamlandı.`,
          });
        }
      } catch (error) {
        results.push({
          intent: functionName,
          status: 'error',
          message: error.message,
        });
      }
    }
    return results;
  }
}
