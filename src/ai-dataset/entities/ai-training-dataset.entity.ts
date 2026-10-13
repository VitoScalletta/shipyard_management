import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_training_datasets')
export class AiTrainingDataset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  agentType: string;

  @Column({ type: 'varchar', length: 50 })
  modelName: string;

  @Column({ type: 'varchar', length: 50 })
  modelVersion: string;

  @Column({ type: 'text', nullable: true })
  systemPrompt: string;

  @Column({ type: 'text' })
  userPrompt: string;

  @Column({ type: 'jsonb', nullable: true })
  shipyardContext: any;

  @Column({ type: 'text' })
  aiResponse: string;

  @Column({ type: 'boolean', nullable: true })
  humanFeedback: boolean;

  @Column({ type: 'text', nullable: true })
  feedbackComment: string;

  @Column({ type: 'int', nullable: true })
  executionTimeMs: number;

  @Column({ type: 'int', nullable: true })
  tokenUsage: number;

  @CreateDateColumn()
  createdAt: Date;
}
