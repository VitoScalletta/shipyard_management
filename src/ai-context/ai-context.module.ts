import { Module } from '@nestjs/common';
import { ProjectContextService } from './project-context.service';

@Module({
  providers: [ProjectContextService]
})
export class AiContextModule {}
