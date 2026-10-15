import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';

@Injectable()
export class WorkforceService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async createEmployee(employeeData: Partial<Employee>): Promise<Employee>{
    const employee = this.employeeRepository.create(employeeData);
    return await this.employeeRepository.save(employee);
  }

  async findAllEmployess(): Promise<Employee[]> {
    return await this.employeeRepository.find({ relations: { team: true } });
  }

  async findOneEmployee(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id }, relations: { team: true } });
    if(!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
    return employee;
  }

  async updateEmployee(id: string, updateData: Partial<Employee>): Promise<Employee>{
    const employee = await this.findOneEmployee(id);
    Object.assign(employee, updateData);
    return await this.employeeRepository.save(employee);
  }

  async createTeam(teamData: Partial<Team>): Promise<Team>{
    const team = this.teamRepository.create(teamData);
    return await this.teamRepository.save(team);
  }

  async findAllTeams(): Promise<Team[]> {
    return await this.teamRepository.find({ relations: { members: true } });
  }
}
