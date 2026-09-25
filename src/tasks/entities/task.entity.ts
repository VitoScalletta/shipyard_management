import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { MeasurementUnit } from 'src/common/enums/measurement-unit.enum';
import { Project } from 'src/projects/entities/project.entity';
import { Ship } from 'src/ships/entities/ship.entity';
import { ShipArea } from 'src/ship-areas/entities/ship-area.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', nullable:  true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taskType: string;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  plannedEndDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number;

  @Column({ type: 'enum', enum: MeasurementUnit, nullable: true })
  unit: MeasurementUnit;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => Ship, { onDelete: 'CASCADE' })
  ship: Ship;

  @ManyToOne(() => ShipArea, { onDelete: 'SET NULL', nullable: true })
  shipArea: ShipArea;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_assignments',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  assignedUsers: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
