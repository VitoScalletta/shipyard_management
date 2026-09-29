import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ResourceType } from '../enums/resource-type.enum';
import { ResourceStatus } from '../enums/resource-status.enum';
import { MeasurementUnit } from '../../common/enums/measurement-unit.enum';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ResourceType })
  type: ResourceType;

  @Column({
    type: 'enum',
    enum: ResourceStatus,
    default: ResourceStatus.AVAILABLE,
  })
  status: ResourceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableQuantity: number;

  @Column({ type: 'enum', enum: MeasurementUnit })
  unit: MeasurementUnit;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
