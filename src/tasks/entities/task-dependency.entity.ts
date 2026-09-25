import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { DependencyType } from '../enums/dependency-type.enum';
@Entity('task_dependencies')
export class TaskDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  predecessor: Task;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  successor: Task;

  @Column({
    type: 'enum',
    enum: DependencyType,
    default: DependencyType.FINISH_TO_START,
  })
  type: DependencyType;

  @CreateDateColumn()
  createdAt: Date;
}
