import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Ship & Project Domain Tests (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdShipId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const testUser = {
      email: `admin.${Date.now()}@shipyard.com`,
      password: 'Password123!',
      firstName: 'Domain',
      lastName: 'Tester',
      role: 'ADMIN',
    };

    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ships (POST) - Yeni bir gemi (Ship) oluşturulabilmeli', async () => {
    const newShip = {
      name: 'Yavuz Fırkateyni',
      imoNumber: `IMO${Date.now()}`, // ÇÖZÜM 1: Her testte benzersiz IMO üretir
      type: 'MILITARY', // veya shipType, senin DTO'ndaki isme göre
      class: 'FRIGATE',
      length: 145,
      beam: 18,
      draft: 6,
    };

    const response = await request(app.getHttpServer())
      .post('/ships')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newShip);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    createdShipId = response.body.id;
  });

  it('/projects (POST) - Oluşturulan gemiye bağlı yeni bir proje başlatılabilmeli', async () => {
    const newProject = {
      name: 'Yavuz Modernizasyon Projesi',
      projectCode: `YVZ-${Date.now()}`,
      description: 'Ana güverte ve radar sistemleri yenilemesi',
      projectType: 'RETROFIT',
      plannedDeliveryDate: '2027-05-01T00:00:00Z',
      ship: { id: createdShipId },
    };

    const response = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newProject);

    expect(response.status).toBe(201);
  });
});
