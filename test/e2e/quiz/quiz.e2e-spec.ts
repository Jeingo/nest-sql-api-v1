import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { QuizPath } from '../../helper/paths-to-endpoints/paths';

describe('Quiz new (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe(`1 GET ${QuizPath}:`, () => {
    it('1.1 should return 401 without authorization', async () => {
      await request(app).get(QuizPath).expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
