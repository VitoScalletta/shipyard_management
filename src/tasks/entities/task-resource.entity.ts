import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { Resource } from '../../resources/entities/resource.entity';
@Entity('task_resources')
export class TaskResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.resources, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => Resource, { onDelete: 'CASCADE'})
  resource: Resource;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  allocatedQuantity: number;

  @CreateDateColumn()
  createdAt: Date;
}
