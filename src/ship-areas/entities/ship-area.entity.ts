import { Ship } from 'src/ships/entities/ship.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AreaType {
  DECK = 'DECK',
  COMPARTMENT = 'COMPARTMENT',
  ZONE = 'ZONE',
}

@Entity('ship_areas')
export class ShipArea {
  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: AreaType, default: AreaType.ZONE })
  type: AreaType;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  size: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string;

  @ManyToOne(() => Ship, (ship) => ship.areas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @ManyToOne(() => ShipArea, (area) => area.subAreas, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_area_id' })
  parentArea: ShipArea;

  @OneToMany(() => ShipArea, (area) => area.parentArea)
  subAreas: ShipArea[];
}
