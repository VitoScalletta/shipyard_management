import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Employee } from './employee.entity';
import { Department } from '../enums/department.enum';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: Department })
  department: Department;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  leader: Employee;

  @OneToMany(() => Employee, (employee) => employee.team)
  members: Employee[];
}
