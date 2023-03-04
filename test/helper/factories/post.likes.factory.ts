import request from 'supertest';
import { authHeader, bearerAccessToken } from '../auth/jwt.auth';

import { PostsPath } from '../paths-to-endpoints/paths';
import { HttpStatus } from '@nestjs/common';

export const savePostLike = async (
  app: any,
  accessToken: string,
  postId: string
): Promise<void> => {
  await request(app)
    .put(PostsPath + '/' + postId + '/' + 'like-status')
    .set(authHeader, bearerAccessToken(accessToken))
    .send({ likeStatus: 'Like' })
    .expect(HttpStatus.NO_CONTENT);
};
