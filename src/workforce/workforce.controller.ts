import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WorkforceService } from './workforce.service';
import { Employee } from './entities/employee.entity';
import { Team } from './entities/team.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workforce')
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  @Post('employees')
  createEmployee(@Body() employeeData: Partial<Employee>) {
    return this.workforceService.createEmployee(employeeData);
  }

  @Get('employees')
  findAllEmployees() {
    return this.workforceService.findAllEmployess();
  }

  @Get('employees/:id')
  findOneEmployee(@Param('id') id: string) {
    return this.workforceService.findOneEmployee(id);
  }

  @Patch('employees/:id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateData: Partial<Employee>,
  ) {
    return this.workforceService.updateEmployee(id, updateData);
  }

  @Post('teams')
  createTeam(@Body() teamData: Partial<Team>) {
    return this.workforceService.createTeam(teamData);
  }

  @Get('teams')
  findAllTeams() {
    return this.workforceService.findAllTeams();
  }
}
