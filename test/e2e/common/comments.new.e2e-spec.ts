import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { CommentsPath, PostsPath } from '../../helper/paths-to-endpoints/paths';
import {
  correctComment,
  correctCommentNew,
  inCorrectComment
} from '../../stubs/comments.stub';
import {
  createUser,
  createUsers,
  loginAndGetPairToken,
  loginAndGetPairTokens,
  saveUser,
  saveUsers
} from '../../helper/factories/users.factory';
import { saveBlog } from '../../helper/factories/blogs.factory';
import { savePost } from '../../helper/factories/posts.factory';
import { saveComment } from '../../helper/factories/comments.factory';
import { OutputCommentDto } from '../../../src/comments/api/dto/output.comment.dto';
import {
  LikeStatus,
  PaginatedType
} from '../../../src/global-types/global.types';
import {
  errorsMessageForIncorrectComment,
  errorsMessageForIncorrectCommentLike
} from '../../stubs/error.stub';
import { authHeader, bearerAccessToken } from '../../helper/auth/jwt.auth';
import {
  badCommentLikeStatus,
  correctCommentLikeStatus
} from '../../stubs/comment.likes.stub';

describe('CommentsController new (e2e)', () => {
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

  describe(`1 GET ${CommentsPath}/id:`, () => {
    it(`1.1 should return 404 if comment don't exist`, async () => {
      await request(app)
        .get(CommentsPath + '/999')
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`1.2 should return 200 and comments by id`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      const response = await request(app)
        .get(CommentsPath + '/' + commentId)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<OutputCommentDto>({
        id: commentId,
        ...correctComment,
        commentatorInfo: {
          userId: userId,
          userLogin: user.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None
        }
      });
    });
  });
  describe(`2 PUT ${CommentsPath}/id:`, () => {
    it(`2.1 should return 401 without authorization`, async () => {
      await request(app)
        .put('/comments/999')
        .send(correctCommentNew)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`2.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      const errMes = await request(app)
        .put(CommentsPath + '/' + commentId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(inCorrectComment)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectComment);
    });
    it(`2.3 should return 404 for not existing comment`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .put(CommentsPath + '/999')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctCommentNew)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`2.4 should return 403 with incorrect token`, async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      const blogId = await saveBlog(app, pairTokens[0].accessToken);
      const postId = await savePost(app, pairTokens[0].accessToken, blogId);
      const commentId = await saveComment(
        app,
        pairTokens[0].accessToken,
        postId
      );

      await request(app)
        .put(CommentsPath + '/' + commentId)
        .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
        .send(correctCommentNew)
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`2.5 should return 204 with correct data`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      await request(app)
        .put(CommentsPath + '/' + commentId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctCommentNew)
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get(CommentsPath + '/' + commentId)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual<OutputCommentDto>({
        id: commentId,
        ...correctCommentNew,
        commentatorInfo: {
          userId: userId,
          userLogin: user.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None
        }
      });
    });
  });
  describe(`3 DELETE ${CommentsPath}/id:`, () => {
    it(`3.1 should return 401 without authorization`, async () => {
      await request(app)
        .delete(CommentsPath + '/999')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`3.2 should return 404 for not existing comment`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .delete(CommentsPath + '/999')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.3 should return 403 with incorrect token`, async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      const blogId = await saveBlog(app, pairTokens[0].accessToken);
      const postId = await savePost(app, pairTokens[0].accessToken, blogId);
      const commentId = await saveComment(
        app,
        pairTokens[0].accessToken,
        postId
      );

      await request(app)
        .delete(CommentsPath + '/' + commentId)
        .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`3.4 should return 204`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      await request(app)
        .delete(CommentsPath + '/' + commentId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get(PostsPath + '/' + postId + '/comments')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputCommentDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
  });
  describe(`4 PUT ${CommentsPath}/id/like-status:`, () => {
    it(`4.1 should return 401 without authorization`, async () => {
      await request(app)
        .put(CommentsPath + '/999/like-status')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 should return 400 with bad body`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      const errMes = await request(app)
        .put(CommentsPath + '/' + commentId + '/' + 'like-status')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(badCommentLikeStatus)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectCommentLike);
    });
    it(`4.3 should return 404 if comment not exist`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .put(CommentsPath + '/999/like-status')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctCommentLikeStatus)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`4.4 should return 204 if all ok`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      await request(app)
        .put(CommentsPath + '/' + commentId + '/' + 'like-status')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctCommentLikeStatus)
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get(CommentsPath + '/' + commentId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);

      expect(response.body).toEqual<OutputCommentDto>({
        id: commentId,
        ...correctComment,
        commentatorInfo: {
          userId: userId,
          userLogin: user.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatus.Like
        }
      });
      const response2 = await request(app)
        .get(CommentsPath + '/' + commentId)
        .expect(HttpStatus.OK);
      expect(response2.body).toEqual({
        id: commentId,
        ...correctComment,
        commentatorInfo: {
          userId: userId,
          userLogin: user.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatus.None
        }
      });
    });
  });
});
