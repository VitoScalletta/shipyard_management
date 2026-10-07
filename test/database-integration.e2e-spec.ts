import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

describe('Database Integration Tests (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('1. PostgreSQL Integration: Veritabanına başarıyla bağlanılmalı', () => {
    expect(dataSource).toBeDefined();
    expect(dataSource.isInitialized).toBeTruthy();
  });

  it('2. Repository Tests: Tüm entity şemaları veritabanına yüklenmiş olmalı', () => {
    const entities = dataSource.entityMetadatas;
    expect(entities.length).toBeGreaterThan(0);

    const entityNames = entities.map((e) => e.name);
    expect(entityNames).toContain('Ship');
    expect(entityNames).toContain('Project');
    expect(entityNames).toContain('Task');
    expect(entityNames).toContain('User');
  });

  it('3. Transaction Tests: ACID Bütünlüğü ve RollBack işlemleri çalışmalı', async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      expect(queryRunner.isTransactionActive).toBeTruthy();

      await queryRunner.rollbackTransaction();
      expect(queryRunner.isTransactionActive).toBeFalsy();
    } finally {
      await queryRunner.release();
    }
  });
});
