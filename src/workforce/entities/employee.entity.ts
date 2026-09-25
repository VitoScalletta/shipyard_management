import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Department } from '../enums/department.enum';
import { Shift } from '../enums/shift.enum';
import { SkillLevel } from '../enums/skill-level.enum';
import { Team } from './team.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'enum', enum: Department })
  department: Department;

  @Column({ type: 'varchar', length: 100 })
  jobPosition: string;

  @Column({type: 'enum', enum : SkillLevel, default: SkillLevel.JUNIOR})
  skillLevel: SkillLevel;

  @Column({ type: 'enum', enum: Shift, default: Shift.MORNING})
  shift: Shift;

  @Column({ type: 'int', default: 45 })
  workingHours: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @ManyToOne(() => Team, (team) => team.members, { nullable: true, onDelete: 'SET NULL' })
  team: Team;
}
