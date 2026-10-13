import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { ShipsModule } from './ships/ships.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShipAreasModule } from './ship-areas/ship-areas.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { WorkforceModule } from './workforce/workforce.module';
import { ResourcesModule } from './resources/resources.module';
import { PlanningModule } from './planning/planning.module';
import { AuditModule } from './audit/audit.module';
import Joi from 'joi';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiContextModule } from './ai-context/ai-context.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { GarsonAiModule } from './garson-ai/garson-ai.module';
import { APP_GUARD } from '@nestjs/core';
import { AiOrchestratorModule } from './ai-orchestrator/ai-orchestrator.module';
import { AiDatasetModule } from './ai-dataset/ai-dataset.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),

        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),

        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),

        OLLAMA_URL: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    ProjectsModule,
    ShipsModule,
    ShipAreasModule,
    UsersModule,
    AuthModule,
    TasksModule,
    WorkforceModule,
    ResourcesModule,
    PlanningModule,
    AuditModule,
    AiContextModule,
    GarsonAiModule,
    AiOrchestratorModule,
    AiDatasetModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
