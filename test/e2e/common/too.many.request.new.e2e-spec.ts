import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { authLoginPath } from '../../helper/paths-to-endpoints/paths';
import {
  createUser,
  createUsers,
  loginAndGetPairTokens,
  saveUser,
  saveUsers
} from '../../helper/factories/users.factory';

describe('Too many request test new (e2e)', () => {
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

  describe.skip(`8 POST ${authLoginPath}: (429)`, () => {
    it('8.1 should return 429 after 5 request in 10 seconds ', async () => {
      const users = createUsers(5);
      await saveUsers(app, users);
      await loginAndGetPairTokens(app, users);

      const user = createUser();
      await saveUser(app, user);

      await request(app)
        .post(authLoginPath)
        .send({
          loginOrEmail: user.login,
          password: user.password
        })
        .expect(HttpStatus.TOO_MANY_REQUESTS);
    });
  });
});
