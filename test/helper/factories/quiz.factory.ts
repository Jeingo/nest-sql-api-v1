import { TestStringID } from '../types/test.type';
import request from 'supertest';
import { QuizPath } from '../paths-to-endpoints/paths';
import { superAdminLogin, superAdminPassword } from '../auth/basic.auth';

export const saveQuiz = async (app: any): Promise<TestStringID> => {
  const correctQuiz = {
    body: 'Question Question 10',
    correctAnswers: ['answer1', 'answer2']
  };
  const response = await request(app)
    .post(QuizPath)
    .auth(superAdminLogin, superAdminPassword)
    .send(correctQuiz);

  return response.body.id;
};
