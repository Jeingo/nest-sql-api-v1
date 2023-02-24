import { TestStringID } from '../types/test.type';
import request from 'supertest';
import { bloggerBlogsPath } from '../paths-to-endpoints/paths';
import { authHeader, bearerAccessToken } from '../auth/jwt.auth';
import { correctPost } from '../../stubs/posts.stub';

export const savePost = async (
  app: any,
  accessToken: string,
  blogId: string
): Promise<TestStringID> => {
  const response = await request(app)
    .post(bloggerBlogsPath + '/' + blogId + '/posts')
    .set(authHeader, bearerAccessToken(accessToken))
    .send(correctPost);
  return response.body.id;
};

export const savePosts = async (
  app: any,
  accessToken: string,
  blogId: string,
  count: number
): Promise<TestStringID[]> => {
  const ids: TestStringID[] = [];
  for (let i = 0; i < count; i++) {
    const response = await request(app)
      .post(bloggerBlogsPath + '/' + blogId + '/posts')
      .set(authHeader, bearerAccessToken(accessToken))
      .send(correctPost);
    ids.push(response.body.id);
  }
  return ids;
};
