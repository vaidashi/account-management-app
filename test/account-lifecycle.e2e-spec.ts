import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Account lifecycle (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates account and allows deposit/withdraw', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .send({ personId: 1, accountType: 1, dailyWithdrawalLimit: 500 })
      .expect(201);

    const accountId = createResponse.body.accountId;

    await request(app.getHttpServer())
      .post(`/api/v1/accounts/${accountId}/deposit`)
      .send({ value: 100 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/accounts/${accountId}/withdraw`)
      .send({ value: 50 })
      .expect(201);

    const statementResponse = await request(app.getHttpServer())
      .get(`/api/v1/accounts/${accountId}/statements?limit=10&offset=0`)
      .expect(200);

    expect(statementResponse.body.total).toBeGreaterThanOrEqual(2);
  });
});
