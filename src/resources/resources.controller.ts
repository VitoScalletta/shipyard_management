import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Resource } from './entities/resource.entity';
import { ResourceStatus } from './enums/resource-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  create(@Body() createData: Partial<Resource>) {
    return this.resourcesService.create(createData);
  }

  @Get()
  findAll(@Query('status') status?: ResourceStatus) {
    return this.resourcesService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Resource>) {
    return this.resourcesService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
