import { timeStamp } from 'console';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true})
  userEmail: string;

  @Column({ type: 'varchar', length: 50})
  action: string;

  @Column({ type: 'varchar', length: 50})
  entityName: string;

  @Column({ type: 'uuid'})
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true})
  newValues: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'uuid', nullable: true })
  requestId: string;

  @CreateDateColumn()
  timeStamp: Date;

}
