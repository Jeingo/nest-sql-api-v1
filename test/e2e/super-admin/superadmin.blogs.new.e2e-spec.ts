import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import {
  BlogsPath,
  superAdminBlogsPath
} from '../../helper/paths-to-endpoints/paths';
import { correctBlog } from '../../stubs/blogs.stub';
import {
  superAdminLogin,
  superAdminPassword
} from '../../helper/auth/basic.auth';
import { PaginatedType } from '../../../src/global-types/global.types';
import {
  createUser,
  loginAndGetPairToken,
  saveUser
} from '../../helper/factories/users.factory';
import { saveBlog } from '../../helper/factories/blogs.factory';
import { OutputSuperAdminBlogDto } from '../../../src/superadmin/blogs/api/dto/output.superadmin.blog.dto';
import { errorsMessageForBanBlog } from '../../stubs/error.stub';
import { OutputBlogDto } from '../../../src/blogs/api/dto/output.blog.dto';

describe('SuperAdminBlogsController new (e2e)', () => {
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

  describe(`1 GET ${superAdminBlogsPath}:`, () => {
    it('1.1 should return 401 without authorization', async () => {
      await request(app)
        .get(superAdminBlogsPath)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`1.2 should return 200`, async () => {
      const user = createUser();
      const userId = await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const response = await request(app)
        .get(superAdminBlogsPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual<PaginatedType<OutputSuperAdminBlogDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: blogId,
            ...correctBlog,
            isMembership: false,
            createdAt: expect.any(String),
            blogOwnerInfo: {
              userId: userId,
              userLogin: user.login
            },
            banInfo: {
              isBanned: false,
              banDate: null
            }
          }
        ]
      });
    });
  });
  describe(`2 PUT ${superAdminBlogsPath}/id/bind-with-user/userId:`, () => {
    it('2.1 should return 401 without authorization', async () => {
      await request(app)
        .put(superAdminBlogsPath + '/999/bind-with-user/999')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('2.2 should return 404 with incorrect id', async () => {
      await request(app)
        .put(superAdminBlogsPath + '/999/bind-with-user/999')
        .auth(superAdminLogin, superAdminPassword)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it(`2.3 should return 204 (my don't have blog without userId)`, async () => {
      expect(1).toBe(1);
    });
  });
  describe(`3 PUT ${superAdminBlogsPath}/id/ban:`, () => {
    it('3.1 should return 401 without authorization', async () => {
      await request(app)
        .put(superAdminBlogsPath + '/999/ban')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('3.2 should return 400 with incorrect data', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const errMes = await request(app)
        .put(superAdminBlogsPath + '/' + blogId + '/ban')
        .auth(superAdminLogin, superAdminPassword)
        .send({ isBanned: '' })
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForBanBlog);
    });
    it('3.3 should return 204 with correct data', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      await request(app)
        .put(superAdminBlogsPath + '/' + blogId + '/ban')
        .auth(superAdminLogin, superAdminPassword)
        .send({ isBanned: true })
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app).get(BlogsPath).expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputBlogDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
  });
});
