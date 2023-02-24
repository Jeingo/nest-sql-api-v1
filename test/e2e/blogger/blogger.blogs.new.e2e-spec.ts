import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { bloggerBlogsPath } from '../../helper/paths-to-endpoints/paths';
import {
  createUser,
  createUsers,
  loginAndGetPairToken,
  loginAndGetPairTokens,
  saveUser,
  saveUsers
} from '../../helper/factories/users.factory';
import { authHeader, bearerAccessToken } from '../../helper/auth/jwt.auth';
import {
  LikeStatus,
  PaginatedType
} from '../../../src/global-types/global.types';
import { OutputBlogDto } from '../../../src/blogs/api/dto/output.blog.dto';
import {
  correctBlog,
  correctNewBlog,
  emptyBlogs,
  incorrectBlog
} from '../../stubs/blogs.stub';
import { saveBlog } from '../../helper/factories/blogs.factory';
import {
  errorsMessageForIncorrectBlog,
  errorsMessageForIncorrectPost,
  errorsMessageForIncorrectPostWithBlogId
} from '../../stubs/error.stub';
import {
  correctNewPost,
  correctPost,
  incorrectPost
} from '../../stubs/posts.stub';
import { OutputPostDto } from '../../../src/posts/api/dto/output.post.dto';
import { savePost } from '../../helper/factories/posts.factory';
import { correctComment } from '../../stubs/comments.stub';
import { saveComment } from '../../helper/factories/comments.factory';
import { OutputBloggerCommentsDto } from '../../../src/blogger/blogs/api/dto/output.blogger.comments.dto';

describe('BloggerBlogsController new (e2e)', () => {
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

  describe(`1 GET ${bloggerBlogsPath}:`, () => {
    it(`1.1 should return 401 without authorization`, async () => {
      await request(app).get(bloggerBlogsPath).expect(HttpStatus.UNAUTHORIZED);
    });
    it(`1.2 should return 200 and empty paginated array`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const response = await request(app)
        .get(bloggerBlogsPath)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputBlogDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
    it(`1.3 should return 200 and one user's blog`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      await saveBlog(app, pairToken.accessToken);
      const response = await request(app)
        .get(bloggerBlogsPath)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputBlogDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            ...correctBlog,
            isMembership: false,
            createdAt: expect.any(String)
          }
        ]
      });
    });
  });
  describe(`2 POST ${bloggerBlogsPath}:`, () => {
    it(`2.1 should return 401 without authorization`, async () => {
      await request(app)
        .post(bloggerBlogsPath)
        .send(correctBlog)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`2.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      const errMes = await request(app)
        .post(bloggerBlogsPath)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(incorrectBlog)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
    });
    it(`2.3 should return 201 and create blog`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      const response = await request(app)
        .post(bloggerBlogsPath)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctBlog)
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual<OutputBlogDto>({
        id: expect.any(String),
        ...correctBlog,
        isMembership: false,
        createdAt: expect.any(String)
      });
    });
  });
  describe(`4 PUT ${bloggerBlogsPath}/id:`, () => {
    it(`4.1 should return 401 without authorization`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      await request(app)
        .put(bloggerBlogsPath + '/' + blogId)
        .send(correctNewBlog)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const errMes = await request(app)
        .put(bloggerBlogsPath + '/' + blogId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(incorrectBlog)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
    });
    it(`4.3 should return 204 with correct data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      await request(app)
        .put(bloggerBlogsPath + '/' + blogId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctNewBlog)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get(bloggerBlogsPath)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            ...correctNewBlog,
            isMembership: false,
            createdAt: expect.any(String)
          }
        ]
      });
    });
    it(`4.4 should return 404 for not existing blog`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .put(bloggerBlogsPath + '/999')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctNewBlog)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`4.5 should return 403 if blogId another user `, async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      await saveBlog(app, pairTokens[0].accessToken);
      const blogIdAnotherUser = await saveBlog(app, pairTokens[1].accessToken);

      await request(app)
        .put(bloggerBlogsPath + '/' + blogIdAnotherUser)
        .set(authHeader, bearerAccessToken(pairTokens[0].accessToken))
        .send(correctNewBlog)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe(`5 DELETE ${bloggerBlogsPath}/id:`, () => {
    it(`5.1 should return 401 without authorization`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      await request(app)
        .delete(bloggerBlogsPath + '/' + blogId)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`5.2 should return 404 for not existing blog`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      await saveBlog(app, pairToken.accessToken);

      await request(app)
        .delete(bloggerBlogsPath + '/999')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`5.3 should return 204 and delete blog`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      await request(app)
        .delete(bloggerBlogsPath + '/' + blogId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.NO_CONTENT);
      await request(app)
        .get(bloggerBlogsPath)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK)
        .expect(emptyBlogs);
    });
    it(`5.4 should return 403 if blogId another user`, async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      await saveBlog(app, pairTokens[0].accessToken);
      const blogIdAnotherUser = await saveBlog(app, pairTokens[1].accessToken);

      await request(app)
        .delete(bloggerBlogsPath + '/' + blogIdAnotherUser)
        .set(authHeader, bearerAccessToken(pairTokens[0].accessToken))
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe(`6 POST ${bloggerBlogsPath}/id/posts:`, () => {
    it(`6.1 should return 401 without authorization`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      await request(app)
        .post(bloggerBlogsPath + '/' + blogId + '/posts')
        .send(correctPost)
        .expect(HttpStatus.UNAUTHORIZED);

      const response = await request(app).get('/posts').expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputPostDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
    it(`6.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const errMes = await request(app)
        .post(bloggerBlogsPath + '/' + blogId + '/posts')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(incorrectPost)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPost);
    });
    it(`6.3 should return 201 with correct data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const response = await request(app)
        .post(bloggerBlogsPath + '/' + blogId + '/posts')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctPost)
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual<OutputPostDto>({
        id: expect.any(String),
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
    it(`6.4 should return 404 for not existing post by blog's id`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      await saveBlog(app, pairToken.accessToken);

      await request(app)
        .post(bloggerBlogsPath + '/999/posts')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctPost)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`6.5 should return 403 if blogId another user`, async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      await saveBlog(app, pairTokens[0].accessToken);
      const blogIdAnotherUser = await saveBlog(app, pairTokens[1].accessToken);

      await request(app)
        .post(bloggerBlogsPath + '/' + blogIdAnotherUser + '/posts')
        .set(authHeader, bearerAccessToken(pairTokens[0].accessToken))
        .send(correctPost)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe(`7 PUT ${bloggerBlogsPath}/id/posts:`, () => {
    it(`7.1 should return 401 without authorization`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      await request(app)
        .put(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`7.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      const errMes = await request(app)
        .put(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(incorrectPost)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPostWithBlogId);
    });
    it(`7.3 should return 404 with incorrect id`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .put(bloggerBlogsPath + '/999/posts/999')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctNewPost)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`7.4 should return 403 if id another user`, async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      const blogId = await saveBlog(app, pairTokens[0].accessToken);
      const blogIdAnotherUser = await saveBlog(app, pairTokens[1].accessToken);
      await savePost(app, pairTokens[0].accessToken, blogId);
      const postIdAnotherUser = await savePost(
        app,
        pairTokens[1].accessToken,
        blogIdAnotherUser
      );

      await request(app)
        .put(
          bloggerBlogsPath +
            '/' +
            blogIdAnotherUser +
            '/posts' +
            '/' +
            postIdAnotherUser
        )
        .set(authHeader, bearerAccessToken(pairTokens[0].accessToken))
        .send(correctNewPost)
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`7.5 should return 204 with correct data`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      await request(app)
        .put(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(correctNewPost)
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get('/posts' + '/' + postId)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<OutputPostDto>({
        id: expect.any(String),
        ...correctNewPost,
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
  describe(`8 DELETE ${bloggerBlogsPath}/id/posts:`, () => {
    it(`8.1 should return 401 without authorization`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      await request(app)
        .delete(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`8.2 should return 404 with incorrect id`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      await request(app)
        .delete(bloggerBlogsPath + '/999/posts/999')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`8.3 should return 403 if id another user`, async () => {
      const users = createUsers(2);
      await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      const blogId = await saveBlog(app, pairTokens[0].accessToken);
      const blogIdAnotherUser = await saveBlog(app, pairTokens[1].accessToken);
      await savePost(app, pairTokens[0].accessToken, blogId);
      const postIdAnotherUser = await savePost(
        app,
        pairTokens[1].accessToken,
        blogIdAnotherUser
      );

      await request(app)
        .delete(
          bloggerBlogsPath +
            '/' +
            blogIdAnotherUser +
            '/posts' +
            '/' +
            postIdAnotherUser
        )
        .set(authHeader, bearerAccessToken(pairTokens[0].accessToken))
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`8.4 should return 204 and delete post`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      await request(app)
        .delete(bloggerBlogsPath + '/' + blogId + '/posts' + '/' + postId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app).get('/posts').expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputPostDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
  });
  describe(`9 GET ${bloggerBlogsPath}/comments:`, () => {
    it(`9.1 should return 401 without authorization`, async () => {
      await request(app)
        .get(bloggerBlogsPath + '/comments')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`9.2 GET should return 200 and comments`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      await saveComment(app, pairToken.accessToken, postId);

      const response = await request(app)
        .get(bloggerBlogsPath + '/comments')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputBloggerCommentsDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            content: correctComment.content,
            commentatorInfo: {
              userId: userId,
              userLogin: user.login
            },
            createdAt: expect.any(String),
            postInfo: {
              id: postId,
              title: correctPost.title,
              blogId: blogId,
              blogName: correctBlog.name
            },
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
});
