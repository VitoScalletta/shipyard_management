import { Module } from '@nestjs/common';
import { WorkforceController } from './workforce.controller';
import { WorkforceService } from './workforce.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Team } from './entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Team])],
  controllers: [WorkforceController],
  providers: [WorkforceService],
})
export class WorkforceModule {}
