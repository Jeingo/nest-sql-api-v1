import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { PostsPath } from '../../helper/paths-to-endpoints/paths';
import { OutputPostDto } from '../../../src/posts/api/dto/output.post.dto';
import {
  LikeStatus,
  PaginatedType
} from '../../../src/global-types/global.types';
import { correctPost } from '../../stubs/posts.stub';
import {
  createUser,
  loginAndGetPairToken,
  saveUser
} from '../../helper/factories/users.factory';
import { saveBlog } from '../../helper/factories/blogs.factory';
import { savePost } from '../../helper/factories/posts.factory';
import { correctBlog } from '../../stubs/blogs.stub';
import { correctComment, inCorrectComment } from '../../stubs/comments.stub';
import {
  errorsMessageForIncorrectComment,
  errorsMessageForIncorrectPostLike
} from '../../stubs/error.stub';
import { authHeader, bearerAccessToken } from '../../helper/auth/jwt.auth';
import { OutputCommentDto } from '../../../src/comments/api/dto/output.comment.dto';
import { saveComment } from '../../helper/factories/comments.factory';
import {
  badPostLikeStatus,
  correctPostLikeStatus
} from '../../stubs/post.likes.stub';

describe('PostsController new (e2e)', () => {
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

  describe(`1 GET ${PostsPath}:`, () => {
    it('1.1 should return 200 and empty array', async () => {
      const response = await request(app).get(PostsPath).expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputPostDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
    it('1.2 should return 200 and post in array', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      const response = await request(app).get(PostsPath).expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputPostDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: postId,
            ...correctPost,
            blogId: blogId,
            blogName: correctBlog.name,
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatus.None,
              newestLikes: []
            }
          }
        ]
      });
    });
  });
  describe(`2 GET ${PostsPath}/id:`, () => {
    it('2.1 should return 404 for not existing posts', async () => {
      await request(app)
        .get(PostsPath + '/999')
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`2.2 should return 200 and post by id`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      const response = await request(app)
        .get(PostsPath + '/' + postId)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<OutputPostDto>({
        id: postId,
        ...correctPost,
        blogId: blogId,
        blogName: correctBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: []
        }
      });
    });
  });
  describe(`3 POST ${PostsPath}/id/comments:`, () => {
    it(`3.1 should return 403 without authorization`, async () => {
      await request(app)
        .post(PostsPath + '/' + '999' + '/comments')
        .send(correctComment)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`3.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      const errMes = await request(app)
        .post(PostsPath + '/' + postId + '/comments')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(inCorrectComment)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectComment);
    });
    it(`3.3 should return 404 for not existing comment`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .post(PostsPath + '/999/comments')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctComment)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.4 should return 201 with correct data`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      const response = await request(app)
        .post(PostsPath + '/' + postId + '/comments')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctComment)
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual<OutputCommentDto>({
        id: expect.any(String),
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
  describe(`4 GET ${PostsPath}/id/comments:`, () => {
    it(`4.1 should return 404 for not existing comment`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .get(PostsPath + '/999/comments')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`4.2 should return 200 and comments by post's id`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      const result = await request(app)
        .get(PostsPath + '/' + postId + '/comments')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);
      expect(result.body).toEqual<PaginatedType<OutputCommentDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
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
          }
        ]
      });
    });
  });
  describe(`5 PUT ${PostsPath}/id/like-status:`, () => {
    it(`5.1 should return 401 without authorization`, async () => {
      await request(app)
        .put('/posts/999/like-status')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`5.2 should return 400 with bad body`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      const errMes = await request(app)
        .put(PostsPath + '/' + postId + '/' + 'like-status')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(badPostLikeStatus)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPostLike);
    });
    it(`5.3 should return 404 if post not exist`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .put(PostsPath + '/999/like-status')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctPostLikeStatus)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`5.4 should return 204 if all ok`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      await request(app)
        .put(PostsPath + '/' + postId + '/' + 'like-status')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctPostLikeStatus)
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get(PostsPath + '/' + postId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);

      expect(response.body).toEqual<OutputPostDto>({
        id: postId,
        ...correctPost,
        blogId: blogId,
        blogName: correctBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatus.Like,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: userId,
              login: user.login
            }
          ]
        }
      });
      const response2 = await request(app)
        .get(PostsPath + '/' + postId)
        .expect(HttpStatus.OK);
      expect(response2.body).toEqual<OutputPostDto>({
        id: postId,
        ...correctPost,
        blogId: blogId,
        blogName: correctBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: userId,
              login: user.login
            }
          ]
        }
      });
    });
  });
});
