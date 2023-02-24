import { TestStringID } from '../types/test.type';
import request from 'supertest';
import { bloggerBlogsPath } from '../paths-to-endpoints/paths';
import { correctBlog } from '../../stubs/blogs.stub';
import { authHeader, bearerAccessToken } from '../auth/jwt.auth';

export const saveBlog = async (
  app: any,
  accessToken: string
): Promise<TestStringID> => {
  const response = await request(app)
    .post(bloggerBlogsPath)
    .set(authHeader, bearerAccessToken(accessToken))
    .send(correctBlog);
  return response.body.id;
};
