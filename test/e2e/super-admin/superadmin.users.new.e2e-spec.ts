import { setConfigNestApp } from '../../configuration.test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  BlogsPath,
  CommentsPath,
  PostsPath,
  superAdminUsersPath
} from '../../helper/paths-to-endpoints/paths';
import {
  superAdminLogin,
  superAdminPassword
} from '../../helper/auth/basic.auth';
import {
  createUser,
  loginAndGetPairToken,
  saveUser
} from '../../helper/factories/users.factory';
import { OutputSuperAdminUserDto } from '../../../src/superadmin/users/api/dto/outputSuperAdminUserDto';
import { PaginatedType } from '../../../src/global-types/global.types';
import { incorrectUser } from '../../stubs/users.stub';
import {
  errorsMessageForBadBan,
  errorsMessageForIncorrectUser
} from '../../stubs/error.stub';
import { badBanInfo, banInfo } from '../../stubs/superadmin.stub';
import { saveBlog } from '../../helper/factories/blogs.factory';
import { savePost } from '../../helper/factories/posts.factory';
import { saveComment } from '../../helper/factories/comments.factory';
import { OutputPostDto } from '../../../src/posts/api/dto/output.post.dto';
import { OutputBlogDto } from '../../../src/blogs/api/dto/output.blog.dto';

describe('SuperAdminUsersController new (e2e)', () => {
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

  describe(`1 GET ${superAdminUsersPath}:`, () => {
    it(`1.1 should return 401 without authorization`, async () => {
      await request(app)
        .get(superAdminUsersPath)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`1.2 should return 200 and empty users`, async () => {
      const response = await request(app)
        .get(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputSuperAdminUserDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
    it(`1.3 should return 200 and empty users with query`, async () => {
      const response = await request(app)
        .get(superAdminUsersPath)
        .query({
          pageNumber: 2,
          pageSize: 5
        })
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputSuperAdminUserDto>>({
        pagesCount: 0,
        page: 2,
        pageSize: 5,
        totalCount: 0,
        items: []
      });
    });
    it(`1.4 should return 200 and one user in array`, async () => {
      const user = createUser();
      await saveUser(app, user);

      const response = await request(app)
        .get(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual<PaginatedType<OutputSuperAdminUserDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: user.login,
            email: user.email,
            createdAt: expect.any(String),
            banInfo: {
              isBanned: false,
              banDate: null,
              banReason: null
            }
          }
        ]
      });
    });
  });
  describe(`2 POST ${superAdminUsersPath}:`, () => {
    it(`2.1 should return 401 without authorization`, async () => {
      const user = createUser();
      await request(app)
        .post(superAdminUsersPath)
        .send(user)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`2.2 should return 400 with incorrect data`, async () => {
      const errMes = await request(app)
        .post(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .send(incorrectUser)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectUser);
    });
    it(`2.3 should return 201 with correct data`, async () => {
      const user = createUser();
      const response = await request(app)
        .post(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .send(user)
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual<OutputSuperAdminUserDto>({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
      });
    });
  });
  describe(`3 DELETE ${superAdminUsersPath}/id:`, () => {
    it(`3.1 should return 401 without authorization`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);

      await request(app)
        .delete(superAdminUsersPath + '/' + userId)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`3.2 should return 404 for not existing user`, async () => {
      await request(app)
        .delete(superAdminUsersPath + '/' + '999')
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.3 should return 201`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);

      await request(app)
        .delete(superAdminUsersPath + '/' + userId)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputSuperAdminUserDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
  });
  describe(`4 PUT ${superAdminUsersPath}/id/ban:`, () => {
    it(`4.1 should return 401 without authorization`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      await request(app)
        .put(superAdminUsersPath + '/' + userId + '/ban')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 should return 400 with incorrect data`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const errMes = await request(app)
        .put(superAdminUsersPath + '/' + userId + '/ban')
        .auth(superAdminLogin, superAdminPassword)
        .send(badBanInfo)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForBadBan);
    });
    it(`4.3 should return 204 with correct data`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);
      const commentId = await saveComment(app, pairToken.accessToken, postId);

      await request(app)
        .put(superAdminUsersPath + '/' + userId + '/ban')
        .auth(superAdminLogin, superAdminPassword)
        .send(banInfo)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: user.login,
            email: user.email,
            createdAt: expect.any(String),
            banInfo: {
              isBanned: banInfo.isBanned,
              banDate: expect.any(String),
              banReason: banInfo.banReason
            }
          }
        ]
      });
      const response2 = await request(app).get(PostsPath).expect(HttpStatus.OK);
      expect(response2.body).toEqual<PaginatedType<OutputPostDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
      const response3 = await request(app).get(BlogsPath).expect(HttpStatus.OK);
      expect(response3.body).toEqual<PaginatedType<OutputBlogDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
      await request(app)
        .get(CommentsPath + '/' + commentId)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
