import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { ShipArea } from 'src/ship-areas/entities/ship-area.entity';

export enum ShipStatus {
  ACTIVE = 'ACTIVE',
  NEW_BUILDING = 'NEW_BUILDING',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

@Entity('ships')
export class Ship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  imoNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shipType: string;

  @Column({ type: 'enum', enum: ShipStatus, default: ShipStatus.ACTIVE })
  status: ShipStatus;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  loa: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  beam: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  draft: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', nullable: true })
  displacement: number;

  @Column({ type: 'decimal', nullable: true })
  grossTonnage: number;

  @Column({ type: 'int', nullable: true })
  netTonnage: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  deckArea: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  enclosedArea: number;

  @OneToMany(() => Project, (project) => project.ship)
  projects: Project[];

  @OneToMany(() => ShipArea,(area) => area.ship)
  areas: ShipArea[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
