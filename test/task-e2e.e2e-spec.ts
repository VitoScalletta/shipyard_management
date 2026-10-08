import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Task & Dependency E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let projectId: string;
  let shipId: string;
  let task1Id: string;
  let task2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const adminUser = {
      email: `admin.task.${Date.now()}@shipyard.com`,
      password: 'Password123!',
      firstName: 'Task',
      lastName: 'Admin',
      role: 'ADMIN',
    };
    await request(app.getHttpServer()).post('/auth/register').send(adminUser);
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    accessToken = loginRes.body.access_token;

    const shipRes = await request(app.getHttpServer())
      .post('/ships')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Task Gemisi', imoNumber: `IMO-T-${Date.now()}` });
    shipId = shipRes.body.id;

    const projectRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Task Projesi',
        projectCode: `PRJ-T-${Date.now()}`,
        ship: { id: shipId },
      });

    projectId = projectRes.body.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/tasks (POST) - Projeye ait yeni bir görev (Task) oluşturulabilmeli', async () => {
    const newTask = {
      name: 'Gövde Kaynak İşlemi',
      description: 'İskele tarafı sac kaynağı',
      projectId: projectId,
      startDate: '2026-10-10T08:00:00Z',
      plannedEndDate: '2026-10-15T18:00:00Z',
      shipId,
    };

    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newTask);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    task1Id = response.body.id;
  });

  it('/tasks (GET) - Görevler listelenebilmeli', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: task1Id }),
      ]),
    );
  });

  it('/tasks (POST) - İkinci görev (Boya İşlemi) oluşturulmalı', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Gövde Boya İşlemi',
        projectId,
        shipId,
      });

    expect(response.status).toBe(201);
    task2Id = response.body.id;
  });

  it('/tasks/dependencies (POST) - Görevler arası bağımlılık oluşturulabilmeli', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks/dependencies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        predecessorId: task1Id,
        successorId: task2Id,
        type: 'FINISH_TO_START',
      });

    expect(response.status).toBe(201);
  });
});
