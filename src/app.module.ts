import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { ShipsModule } from './ships/ships.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'root',
      password: 'rootpassword',
      database: 'shipyard_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProjectsModule,
    ShipsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
