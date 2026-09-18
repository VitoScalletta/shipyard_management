import { Module } from '@nestjs/common';
import { ShipAreasService } from './ship-areas.service';
import { ShipAreasController } from './ship-areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipArea } from './entities/ship-area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipArea])]
  controllers: [ShipAreasController],
  providers: [ShipAreasService],
})
export class ShipAreasModule {}
