import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import {
  authLoginPath,
  authLogoutPath,
  authMePath,
  authNewPasswordPath,
  authPasswordRecoveryPath,
  authRefreshTokenPath,
  authRegistrationConfirmationPath,
  authRegistrationEmailResendingPath,
  authRegistrationPath
} from '../../helper/paths-to-endpoints/paths';
import {
  createUser,
  loginAndGetPairToken,
  saveUser
} from '../../helper/factories/users.factory';
import { correctBadLogin, incorrectLogin } from '../../stubs/users.stub';
import {
  errorsMessageForConfirmation,
  errorsMessageForEmailResending,
  errorsMessageForIncorrectLogin,
  errorsMessageForNewPassword,
  errorsMessageForPasswordRecovery,
  errorsMessageForRegistration
} from '../../stubs/error.stub';
import { authHeader, bearerAccessToken } from '../../helper/auth/jwt.auth';
import {
  badEmailForResending,
  incorrectCodeConfirmation,
  incorrectEmailForResending,
  incorrectNewPassword
} from '../../stubs/auth.stub';
import { OutputAccessTokenDto } from '../../../src/auth/api/dto/output.token.dto';
import { OutputUserMeDto } from '../../../src/auth/api/dto/output.user.me.dto';

describe('AuthController new (e2e)', () => {
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

  describe(`1 POST ${authLoginPath}:`, () => {
    it(`1.1 should return 401 without authorization`, async () => {
      const user = createUser();
      await saveUser(app, user);
      await request(app)
        .post(authLoginPath)
        .send(correctBadLogin)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('1.2 should return 400 with incorrect data', async () => {
      const errMes = await request(app)
        .post(authLoginPath)
        .send(incorrectLogin)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectLogin);
    });
    it('1.3 should return 200 with correct data', async () => {
      const user = createUser();
      await saveUser(app, user);
      const response = await request(app)
        .post(authLoginPath)
        .send({
          loginOrEmail: user.login,
          password: user.password
        })
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<OutputAccessTokenDto>({
        accessToken: expect.any(String)
      });
      expect(response.headers['set-cookie'][0].split(';')[0]).toEqual(
        expect.any(String)
      );
    });
  });
  describe(`2 GET ${authMePath}:`, () => {
    it('2.1 should return 401 without authorization', async () => {
      await request(app).get(authMePath).expect(HttpStatus.UNAUTHORIZED);
    });
    it('2.2 should return 200 with correct data', async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const response = await request(app)
        .get(authMePath)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<OutputUserMeDto>({
        email: user.email,
        login: user.login,
        userId: userId
      });
    });
  });
  describe(`3 POST ${authRegistrationPath}:`, () => {
    it('3.1 should return 400 with invalid data (the same login and email)', async () => {
      const user = createUser();
      await saveUser(app, user);
      const response = await request(app)
        .post(authRegistrationPath)
        .send(user)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual(errorsMessageForRegistration);
    });
    it('3.2 should return 204 with correct data', async () => {
      const user = createUser();
      await request(app)
        .post(authRegistrationPath)
        .send(user)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe('4 POST /auth/registration-confirmation:', () => {
    it('4.1 should return 400 with incorrect data', async () => {
      const response = await request(app)
        .post(authRegistrationConfirmationPath)
        .send(incorrectCodeConfirmation)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual(errorsMessageForConfirmation);
    });
    it('4.2 should return 204 with correct code (Try it yourself)', async () => {
      expect(1).toBe(1);
    });
  });
  describe(`5 POST ${authRegistrationEmailResendingPath}:`, () => {
    it('5.1 should return 400 with incorrect data', async () => {
      const errMes = await request(app)
        .post(authRegistrationEmailResendingPath)
        .send(incorrectEmailForResending)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForEmailResending);
    });
  });
  describe(`6 POST ${authRefreshTokenPath}:`, () => {
    it('6.1 should return 401 if refresh-token is wrong', async () => {
      await request(app)
        .post(authRefreshTokenPath)
        .set('Cookie', 'bad refresh token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('6.2 should return 200 with correct refresh token', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const response = await request(app)
        .post(authRefreshTokenPath)
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        accessToken: expect.any(String)
      });
      expect(response.headers['set-cookie'][0].split(';')[0]).toEqual(
        expect.any(String)
      );
    });
  });
  describe(`7 POST ${authLogoutPath}:`, () => {
    it('7.1 should return 401 if refresh-token is wrong', async () => {
      await request(app)
        .post(authLogoutPath)
        .set('Cookie', 'bad refresh token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('7.2 should return 200 with correct refresh token', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      await request(app)
        .post(authLogoutPath)
        .set('Cookie', pairToken.refreshToken)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe(`8 POST ${authPasswordRecoveryPath}:`, () => {
    it('8.1 should return 400 with incorrect email', async () => {
      const errMes = await request(app)
        .post(authPasswordRecoveryPath)
        .send(badEmailForResending)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForPasswordRecovery);
    });
    it('8.2 POST should return 204 with correct code (Try it yourself)', async () => {
      expect(1).toBe(1);
    });
  });
  describe(`9 POST ${authNewPasswordPath}:`, () => {
    it('9.1 POST should return 400 with incorrect value', async () => {
      const errMes = await request(app)
        .post(authNewPasswordPath)
        .send(incorrectNewPassword)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForNewPassword);
    });
  });
});
