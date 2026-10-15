import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuditLog } from '../audit-log.entity';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(private dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (
      !event.entity ||
      !event.databaseEntity ||
      event.metadata.targetName === 'AuditLog'
    ) {
      return;
    }

    const entityName = event.metadata.targetName;
    const entityId = event.entity.id;
    const oldValues = event.databaseEntity;
    const newValues = event.entity;

    const auditLog = event.manager.create(AuditLog, {
      action: 'UPDATE',
      entityName,
      entityId,
      oldValues,
      newValues,
    });

    await event.manager.save(AuditLog, auditLog);
  }
}
