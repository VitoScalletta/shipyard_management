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

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.NEW_BUILDING,
  })
  type: ProjectType;

  @ManyToOne(() => Ship, (ship) => ship.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @Column({ type: 'date', nullable: true })
  plannedStartDate: Date;

  @Column({ type: 'date', nullable: true })
  plannedDeliveryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
