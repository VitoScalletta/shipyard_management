import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { ContextSnapshot } from './context-snapshot.entity';

@Entity('project_analysis')
export class ProjectAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @Column({ type: 'varchar', length: 50 })
  overallRiskLevel: string;

  @Column({ type: 'text' })
  projectStatus: string;

  @Column({ type: 'jsonb' })
  risks: any[];

  @Column({ type: 'jsonb' })
  recommendations: any[];

  @Column({ type: 'jsonb' })
  criticalPathAnalysis: any;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'varchar', length: 50 })
  modelVersion: string;

  @Column({ type: 'int' })
  executionTimeMs: number;

  @OneToOne(() => ContextSnapshot)
  @JoinColumn({ name: 'snapshotId' })
  contextSnapchot: ContextSnapshot;

  @Column()
  snapshotId: string;

  @CreateDateColumn()
  generatedTimestamp: Date;
}
