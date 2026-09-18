import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ship } from '../../ships/entities/ship.entity';

export enum ProjectType {
  NEW_BUILDING = 'NEW_BUILDING',
  MAINTENANCE = 'MAINTENANCE',
  CONVERSION = 'CONVERSION',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  projectCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.NEW_BUILDING,
  })
  type: ProjectType;

  @Column({type: 'enum', enum: ProjectPriority, default: ProjectPriority.MEDIUM})
  priority: ProjectPriority;

  @Column({type: 'enum', enum: ProjectStatus, default: ProjectStatus.PLANNING})
  status: ProjectStatus;

  @ManyToOne(() => Ship, (ship) => ship.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @Column({ type: 'date', nullable: true })
  plannedStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  plannedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'int', nullable: true, default: 0 })
  estimatedManHours: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  actualManHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
