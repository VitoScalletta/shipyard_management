import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from './../src/users/entities/user.entity';

describe('Auth & E2E Security Tests (2e2)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get<DataSource>(DataSource);
    await dataSource.getRepository(User).delete({ email: testUser.email });
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.getRepository(User).delete({ email: testUser.email });
    }
    if (app) {
      await app.close();
    }
  });

  const testUser = {
    email: 'e2e.test@shipyard.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
  };

  it('/auth/register (POST) - Yeni Kullanıcı kaydedebilmeli', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
  });

  it('/auth/login (POST) - Kayıtlı kullanıcı giriş yapıp token alabilmeli', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
    accessToken = response.body.access_token;
  });

  it('Unauthorized access - Token olmadan korumalı bir uç noktaya (endpoint) erişilememeli', async () => {
    const response = await request(app.getHttpServer())
      .get('/projects');

    expect(response.status).toBe(401);
  });

  it('Role-based restrictions - Geçerli token ile korumalı alana erişilebilmeli', async () => {
    const response = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).not.toBe(401);
  });
});
