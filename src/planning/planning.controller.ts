import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@Controller('planning')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get('project/:projectId/progress')
  @Roles(Role.ADMIN, Role.MANAGER)
  getProjectProgress(@Param('projectId') projectId: string) {
    return this.planningService.calculateProjectProgress(projectId);
  }

  @Get('team/:teamId/workload')
  @Roles(Role.ADMIN, Role.ENGINEER, Role.MANAGER)
  getTeamWorkLoad(@Param('teamId') teamId: string) {
    return this.planningService.calculateTeamWorkLoad(teamId);
  }

  @Get('project/:projectId/critical-path')
  @Roles(Role.ADMIN, Role.MANAGER)
  getCriticalPath(@Param('projectId') projectId: string) {
    return this.planningService.calculatedCriticalPath(projectId);
  }
}
