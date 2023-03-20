import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { QuizPath } from '../../helper/paths-to-endpoints/paths';
import {
  superAdminLogin,
  superAdminPassword
} from '../../helper/auth/basic.auth';
import { PaginatedType } from '../../../src/global-types/global.types';
import {
  errorsMessageForIncorrectQuiz,
  errorsMessageForIncorrectQuizPublished
} from '../../stubs/error.stub';
import {
  correctQuiz,
  incorrectQuiz,
  newCorrectQuiz
} from '../../stubs/quiz.stub';
import { saveQuiz } from '../../helper/factories/quiz.factory';

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
    it(`1.2 should return 200`, async () => {
      const quizId = await saveQuiz(app);

      const response = await request(app)
        .get(QuizPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<any>>({
        //todo set type
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: quizId,
            body: correctQuiz.body,
            correctAnswers: correctQuiz.correctAnswers,
            published: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ]
      });
    });
  });
  describe(`2 POST ${QuizPath}:`, () => {
    it('2.1 should return 401 without authorization', async () => {
      await request(app).post(QuizPath).expect(HttpStatus.UNAUTHORIZED);
    });
    it(`2.2 should return 400 with incorrect data`, async () => {
      const errMes = await request(app)
        .post(QuizPath)
        .auth(superAdminLogin, superAdminPassword)
        .send(incorrectQuiz)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectQuiz);
    });
    it(`2.3 should return 201 with correct data`, async () => {
      const response = await request(app)
        .post(QuizPath)
        .auth(superAdminLogin, superAdminPassword)
        .send(correctQuiz)
        .expect(HttpStatus.NO_CONTENT);
      expect(response.body).toEqual({
        id: expect.any(String),
        body: correctQuiz.body,
        correctAnswers: correctQuiz.correctAnswers,
        published: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });
  });
  describe(`3 DELETE ${QuizPath}/id:`, () => {
    it('3.1 should return 401 without authorization', async () => {
      const quizId = await saveQuiz(app);

      await request(app)
        .delete(QuizPath + '/' + quizId)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`3.2 should return 404 for not existing quiz`, async () => {
      await request(app)
        .delete(QuizPath + '/' + '999')
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.3 should return 204`, async () => {
      const quizId = await saveQuiz(app);

      await request(app)
        .delete(QuizPath + '/' + quizId)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get(QuizPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<any>>({
        //todo set type
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
  });
  describe(`4 PUT ${QuizPath}/id:`, () => {
    it('4.1 should return 401 without authorization', async () => {
      const quizId = await saveQuiz(app);

      await request(app)
        .put(QuizPath + '/' + quizId)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 should return 404 for not existing quiz`, async () => {
      await request(app)
        .put(QuizPath + '/' + '999')
        .auth(superAdminLogin, superAdminPassword)
        .send(newCorrectQuiz)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`4.3 should return 400 with incorrect data`, async () => {
      const quizId = await saveQuiz(app);

      const errMes = await request(app)
        .put(QuizPath + '/' + quizId)
        .auth(superAdminLogin, superAdminPassword)
        .send(incorrectQuiz)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectQuiz);
    });
    it(`4.4 should return 204`, async () => {
      const quizId = await saveQuiz(app);

      await request(app)
        .put(QuizPath + '/' + quizId)
        .auth(superAdminLogin, superAdminPassword)
        .send(newCorrectQuiz)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get(QuizPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<any>>({
        //todo set type
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: quizId,
            body: newCorrectQuiz.body,
            correctAnswers: newCorrectQuiz.correctAnswers,
            published: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ]
      });
    });
  });
  describe(`5 PUT ${QuizPath}/id/publish:`, () => {
    it('5.1 should return 401 without authorization', async () => {
      const quizId = await saveQuiz(app);

      await request(app)
        .put(QuizPath + '/' + quizId + '/publish')
        .send({ published: true })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('5.2 should return 401 without authorization', async () => {
      const quizId = await saveQuiz(app);

      await request(app)
        .put(QuizPath + '/' + quizId + '/publish')
        .send({ published: true })
        .expect(HttpStatus.UNAUTHORIZED);

      const errMes = await request(app)
        .put(QuizPath + '/' + quizId + '/publish')
        .auth(superAdminLogin, superAdminPassword)
        .send({ published: '' })
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectQuizPublished);
    });
    it(`5.3 should return 204`, async () => {
      const quizId = await saveQuiz(app);

      await request(app)
        .put(QuizPath + '/' + quizId + '/publish')
        .auth(superAdminLogin, superAdminPassword)
        .send({ published: true })
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get(QuizPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<any>>({
        //todo set type
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: quizId,
            body: correctQuiz.body,
            correctAnswers: correctQuiz.correctAnswers,
            published: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ]
      });
    });
  });
});
