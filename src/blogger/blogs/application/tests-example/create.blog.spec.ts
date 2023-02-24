import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateBlogUseCase } from '../use-cases/create.blog.use.case';

import {
  Blog,
  BlogSchema,
  IBlogModel
} from '../../../../blogs/domain/entities/blog.entity';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import {
  IUserModel,
  User,
  UserSchema
} from '../../../../users/domain/entities/user.entity';

describe('CreateBlogUseCase', () => {
  let createBlogUseCase: CreateBlogUseCase;
  let mongoMemoryServer: MongoMemoryServer;
  let testingModule: TestingModule;
  let blogModel;
  let userModel;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();

    testingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoMemoryServer.getUri(), {
          dbName: process.env.DB_NAME
        }),
        MongooseModule.forFeature([
          { name: Blog.name, schema: BlogSchema },
          { name: User.name, schema: UserSchema }
        ])
      ],
      providers: [CreateBlogUseCase, BlogsRepository]
    }).compile();

    createBlogUseCase = testingModule.get<CreateBlogUseCase>(CreateBlogUseCase);
    blogModel = testingModule.get<Model<IBlogModel>>(getModelToken(Blog.name));
    userModel = testingModule.get<Model<IUserModel>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await mongoMemoryServer.stop();
    await testingModule.close();
  });

  it('should be defined', async () => {
    expect(createBlogUseCase).toBeDefined();
  });
  it('should create blog', async () => {
    const user = userModel.make('login', 'password', 'email@gmail.com', true);
    await user.save();
    const dto = {
      name: 'Name',
      description: 'Description',
      websiteUrl: 'https://testurl.com'
    };
    const userInfo = {
      userId: user._id.toString(),
      login: user.login
    };
    const result = await createBlogUseCase.execute({
      createBlogDto: dto,
      user: userInfo
    });
    const createdBlogId = result.toString();
    const blogFromDB = await blogModel.findById(result);
    console.log(blogFromDB);
    expect(createdBlogId).toEqual(blogFromDB._id.toString());
  });
});
