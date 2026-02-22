import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Withdrawal limits (e2e)', () => {
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

  it('rejects withdrawals over the daily limit', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .send({ personId: 1, accountType: 1, dailyWithdrawalLimit: 100 })
      .expect(201);

    const accountId = createResponse.body.accountId;

    await request(app.getHttpServer())
      .post(`/api/v1/accounts/${accountId}/deposit`)
      .send({ value: 200 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/accounts/${accountId}/withdraw`)
      .send({ value: 60 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/accounts/${accountId}/withdraw`)
      .send({ value: 60 })
      .expect(422);
  });
});
