import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    action: string,
    entityName: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string,
    requestId?: string,
  ) {
    try {
      const auditLog = this.auditLogRepository.create({
        action,
        entityName,
        entityId,
        oldValues,
        newValues,
        userId,
        userEmail,
        ipAddress,
        userAgent,
        requestId,
      });
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error(`Audit Log yazılamadı: ${error.message}`, error.stack);
    }
  }
}
