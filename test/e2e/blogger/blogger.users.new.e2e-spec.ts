import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import {
  bloggerUsersPath,
  PostsPath
} from '../../helper/paths-to-endpoints/paths';
import {
  correctBlogBan,
  incorrectBlogBan
} from '../../stubs/blogger.users.stub';
import {
  createUser,
  createUsers,
  loginAndGetPairToken,
  loginAndGetPairTokens,
  saveUser,
  saveUsers
} from '../../helper/factories/users.factory';
import { saveBlog } from '../../helper/factories/blogs.factory';
import { authHeader, bearerAccessToken } from '../../helper/auth/jwt.auth';
import { PaginatedType } from '../../../src/global-types/global.types';
import { OutputBloggerUserDto } from '../../../src/blogger/users/api/dto/output.blogger.user.dto';
import { errorsMessageForBloggerBanUser } from '../../stubs/error.stub';
import { savePost } from '../../helper/factories/posts.factory';
import { correctComment } from '../../stubs/comments.stub';

describe('BloggerUsersController new (e2e)', () => {
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

  describe(`1 GET ${bloggerUsersPath}:`, () => {
    it(`1.1 should return 401 without authorization`, async () => {
      await request(app)
        .get(bloggerUsersPath + '/blog/999')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`1.2 should return 200 with correct data`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const blogBan = { ...correctBlogBan, blogId: blogId };

      await request(app)
        .put(bloggerUsersPath + '/' + userId + '/ban')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(blogBan)
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get(bloggerUsersPath + '/blog' + '/' + blogId)
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputBloggerUserDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: user.login,
            banInfo: {
              isBanned: blogBan.isBanned,
              banDate: expect.any(String),
              banReason: blogBan.banReason
            }
          }
        ]
      });
    });
  });
  describe(`2 PUT ${bloggerUsersPath}/id/ban:`, () => {
    it(`2.1 should return 401 without authorization`, async () => {
      await request(app)
        .put(bloggerUsersPath + '/999/ban')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`2.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);

      const errMes = await request(app)
        .put(bloggerUsersPath + '/' + userId + '/ban')
        .set(authHeader, bearerAccessToken(pairToken.accessToken))
        .send(incorrectBlogBan)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForBloggerBanUser);
    });
    it(`2.3 should return 204 with correct data`, async () => {
      const users = createUsers(3);
      const userIds = await saveUsers(app, users);
      const pairTokens = await loginAndGetPairTokens(app, users);
      const blogId = await saveBlog(app, pairTokens[0].accessToken);
      const postId = await savePost(app, pairTokens[0].accessToken, blogId);
      const blogBan = { ...correctBlogBan, blogId: blogId };

      await request(app)
        .put(bloggerUsersPath + '/' + userIds[1] + '/ban')
        .set(authHeader, bearerAccessToken(pairTokens[0].accessToken))
        .send(blogBan)
        .expect(HttpStatus.NO_CONTENT);

      await request(app)
        .post(PostsPath + '/' + postId + '/comments')
        .set(authHeader, bearerAccessToken(pairTokens[1].accessToken))
        .send(correctComment)
        .expect(HttpStatus.FORBIDDEN);

      await request(app)
        .post(PostsPath + '/' + postId + '/comments')
        .set(authHeader, bearerAccessToken(pairTokens[2].accessToken))
        .send(correctComment)
        .expect(HttpStatus.CREATED);
    });
  });
});
