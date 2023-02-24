import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { SecurityPath } from '../../helper/paths-to-endpoints/paths';
import { OutputSessionDto } from '../../../src/sessions/api/dto/output.session.dto';
import {
  createUser,
  createUsers,
  loginAndGetPairToken,
  loginAndGetPairTokens,
  saveUser,
  saveUsers
} from '../../helper/factories/users.factory';
import { delay } from '../../helper/delay';

describe('SecurityDeviceController new (e2e)', () => {
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

  describe(`1 GET ${SecurityPath}:`, () => {
    it('1.1 should return 401 with incorrect cookie', async () => {
      await request(app).get(SecurityPath).expect(HttpStatus.UNAUTHORIZED);
    });
    it('1.2 should return 200 with correct data', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      const response = await request(app)
        .get(SecurityPath)
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual<OutputSessionDto[]>([
        {
          ip: expect.any(String),
          title: 'some device',
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String)
        }
      ]);
    });
  });
  describe(`2 DELETE ${SecurityPath}:`, () => {
    it('2.1 should return 401 with incorrect cookie', async () => {
      await request(app).delete(SecurityPath).expect(HttpStatus.UNAUTHORIZED);
    });
    it('2.2 DELETE should return 204', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      await delay(2);
      await loginAndGetPairToken(app, user);

      await request(app)
        .delete(SecurityPath)
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get(SecurityPath)
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual<OutputSessionDto[]>([
        {
          ip: expect.any(String),
          title: 'some device',
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String)
        }
      ]);
    });
  });
  describe(`3 DELETE ${SecurityPath}:id:`, () => {
    it('3.1 should return 401 with incorrect cookie', async () => {
      await request(app)
        .delete(SecurityPath + '/999')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('3.2 should return 404 with incorrect deviceId', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .delete(SecurityPath + '/999')
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('3.3 should return 403 with other user', async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);

      const response = await request(app)
        .get(SecurityPath)
        .set('Cookie', pairTokens[0].refreshToken)
        .expect(HttpStatus.OK);

      const deviceId = response.body[0].deviceId;

      await request(app)
        .delete(SecurityPath + '/' + deviceId)
        .set('Cookie', pairTokens[1].refreshToken)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('3.4 should return 204 ', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      const response = await request(app)
        .get(SecurityPath)
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.OK);

      const deviceId = response.body[0].deviceId;

      await request(app)
        .delete(SecurityPath + '/' + deviceId)
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
