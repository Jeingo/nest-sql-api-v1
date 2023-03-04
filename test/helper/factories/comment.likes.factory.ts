import request from 'supertest';
import { authHeader, bearerAccessToken } from '../auth/jwt.auth';

import { CommentsPath } from '../paths-to-endpoints/paths';
import { HttpStatus } from '@nestjs/common';

export const saveCommentLike = async (
  app: any,
  accessToken: string,
  commentId: string
): Promise<void> => {
  await request(app)
    .put(CommentsPath + '/' + commentId + '/' + 'like-status')
    .set(authHeader, bearerAccessToken(accessToken))
    .send({ likeStatus: 'Like' })
    .expect(HttpStatus.NO_CONTENT);
};
