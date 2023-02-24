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
