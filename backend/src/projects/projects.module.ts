import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipArea } from '../ship-areas/entities/ship-area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ShipArea])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
