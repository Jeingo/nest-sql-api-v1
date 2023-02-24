import { TestStringID } from '../types/test.type';
import request from 'supertest';
import { authHeader, bearerAccessToken } from '../auth/jwt.auth';
import { correctComment } from '../../stubs/comments.stub';

export const saveComment = async (
  app: any,
  accessToken: string,
  postId: string
): Promise<TestStringID> => {
  const response = await request(app)
    .post('/posts' + '/' + postId + '/comments')
    .set(authHeader, bearerAccessToken(accessToken))
    .send(correctComment);
  return response.body.id;
};

export const saveComments = async (
  app: any,
  accessToken: string,
  postId: string,
  count: number
): Promise<TestStringID[]> => {
  const ids: TestStringID[] = [];
  for (let i = 0; i < count; i++) {
    const response = await request(app)
      .post('/posts' + '/' + postId + '/comments')
      .set(authHeader, bearerAccessToken(accessToken))
      .send(correctComment);
    ids.push(response.body.id);
  }
  return ids;
};
