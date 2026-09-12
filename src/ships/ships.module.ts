import { Module } from '@nestjs/common';
import { ShipsController } from './ships.controller';
import { ShipsService } from './ships.service';
import { Ship } from './entities/ship.entity';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ship])],
  controllers: [ShipsController],
  providers: [ShipsService]
})
export class ShipsModule {}
