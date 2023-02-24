import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { BlogsPath } from '../../helper/paths-to-endpoints/paths';
import {
  LikeStatus,
  PaginatedType
} from '../../../src/global-types/global.types';
import { OutputBlogDto } from '../../../src/blogs/api/dto/output.blog.dto';
import {
  createUser,
  loginAndGetPairToken,
  saveUser
} from '../../helper/factories/users.factory';
import { saveBlog } from '../../helper/factories/blogs.factory';
import { correctBlog } from '../../stubs/blogs.stub';
import { correctPost } from '../../stubs/posts.stub';
import { savePost } from '../../helper/factories/posts.factory';
import { OutputPostDto } from '../../../src/posts/api/dto/output.post.dto';

describe('BlogsController new (e2e)', () => {
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

  describe(`1 GET ${BlogsPath}:`, () => {
    it(`1.1 should return 200 and empty paginated array`, async () => {
      const response = await request(app).get(BlogsPath).expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputBlogDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
    it(`1.2 should return 200 and one blog in array`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const response = await request(app).get(BlogsPath).expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputBlogDto>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: blogId,
            ...correctBlog,
            isMembership: false,
            createdAt: expect.any(String)
          }
        ]
      });
    });
  });
  describe(`2 GET ${BlogsPath}/id:`, () => {
    it('2.1 should return 404 for not existing blog', async () => {
      await request(app).get('/blogs/999').expect(HttpStatus.NOT_FOUND);
    });
    it('2.2 should return 200 with blog', async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const response = await request(app)
        .get(BlogsPath + '/' + blogId)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<OutputBlogDto>({
        id: blogId,
        ...correctBlog,
        isMembership: false,
        createdAt: expect.any(String)
      });
    });
  });
  describe(`3 GET ${BlogsPath}/id/posts:`, () => {
    it(`3.1 should return 404 for not existing post by blog's id`, async () => {
      await request(app)
        .get(BlogsPath + '/999/posts')
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.2 should return 200 and empty post`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);

      const response = await request(app)
        .get(BlogsPath + '/' + blogId + '/posts')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<PaginatedType<OutputPostDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
    });
    it(`3.3 should return 200 and post`, async () => {
      const user = createUser();
      await saveUser(app, user);
      const pairToken = await loginAndGetPairToken(app, user);
      const blogId = await saveBlog(app, pairToken.accessToken);
      const postId = await savePost(app, pairToken.accessToken, blogId);

      const response = await request(app)
        .get(BlogsPath + '/' + blogId + '/posts')
        .expect(HttpStatus.OK);
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
});
