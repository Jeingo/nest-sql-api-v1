import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { Blog, BlogSchema } from './blogs/domain/entities/blog.entity';
import { Post, PostSchema } from './posts/domain/entities/post.entity';
import { User, UserSchema } from './users/domain/entities/user.entity';
import {
  Comment,
  CommentSchema
} from './comments/domain/entities/comment.entity';
import {
  Session,
  SessionSchema
} from './sessions/domain/entities/session.entity';
import {
  PostLike,
  PostLikeSchema
} from './post-likes/domain/entities/post.like.entity';
import {
  CommentLike,
  CommentLikeSchema
} from './comment-likes/domain/entities/comment.like.entity';
import { AuthController } from './auth/api/auth.controller';
import { UsersRepository } from './users/infrastructure/users.repository';
import { JwtAdapter } from './adapters/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from './sessions/infrastructure/sessions.repository';
import { EmailManager } from './adapters/email/email.manager';
import { EmailService } from './adapters/email/email.service';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query.repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostLikesRepository } from './post-likes/infrastructure/post.likes.repository';
import { CommentLikesRepository } from './comment-likes/infrastructure/comment.likes.repository';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { PostsController } from './posts/api/posts.controller';
import { IsBlogIdConstraint } from './helper/validation-decorators/is.blog.id.decorator';
import { SecurityDevicesController } from './sessions/api/security.devices.controller';
import { SessionsQueryRepository } from './sessions/infrastructure/sessions.query.repository';
import { TestingController } from './testing/api/testing.controller';
import { TestingService } from './testing/application/testing.service';
import {
  CheckId,
  CheckIdAndParseToDBId
} from './helper/pipes/check.id.validator.pipe';
import { EmailNotExistConstraint } from './helper/validation-decorators/email.not.exist.decorator';
import { LoginExistConstraint } from './helper/validation-decorators/login.exist.decorator';
import { EmailConfirmationCodeIsCorrectConstraint } from './helper/validation-decorators/email.confirmation.code.is.correct.decorator';
import { EmailExistAndDontConfirmedConstraint } from './helper/validation-decorators/email.exist.and.dont.confirmed.decorator';
import { PasswordRecoveryCodeIsCorrectConstraint } from './helper/validation-decorators/password.recover.code.is.correct.decorator';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/infrastructure/strategies/jwt.strategy';
import { BasicStrategy } from './auth/infrastructure/strategies/basic.strategy';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUserUseCase } from './auth/application/use-cases/registration.user.use.case';
import { ConfirmEmailUseCase } from './auth/application/use-cases/confirm.email.use.case';
import { ValidateUserInLoginUseCase } from './auth/application/use-cases/validate.user.in.login.use.case';
import { ResendEmailConfirmationUseCase } from './auth/application/use-cases/resend.email.confirmation.use.case';
import { RecoveryPasswordUseCase } from './auth/application/use-cases/recovery.password.use.case';
import { SetNewPasswordUseCase } from './auth/application/use-cases/set.new.password.use.case';
import { CreateBlogUseCase } from './blogger/blogs/application/use-cases/create.blog.use.case';
import { UpdateBlogUseCase } from './blogger/blogs/application/use-cases/update.blog.use.case';
import { RemoveBlogUseCase } from './blogger/blogs/application/use-cases/remove.blog.use.case';
import { CreateCommentUseCase } from './comments/application/use.cases/create.comment.use.case';
import { UpdateCommentUseCase } from './comments/application/use.cases/update.comment.use.case';
import { RemoveCommentUseCase } from './comments/application/use.cases/remove.comment.use.case';
import { UpdateLikeStatusInCommentUseCase } from './comments/application/use.cases/update.status.like.in.comment.use.case';
import { CreatePostInBlogUseCase } from './blogger/blogs/application/use-cases/create.post.in.blog.use.case';
import { UpdatePostUseCase } from './blogger/blogs/application/use-cases/update.post.use.case';
import { RemovePostUseCase } from './blogger/blogs/application/use-cases/remove.post.use.case';
import { UpdateStatusLikeInPostUseCase } from './posts/application/use-cases/update.status.like.in.post.use.case';
import { CreateUserUseCase } from './superadmin/users/application/use-cases/create.user.use.case';
import { RemoveUserUseCase } from './superadmin/users/application/use-cases/remove.user.use.case';
import { CreateSessionUseCase } from './sessions/application/use-cases/create.session.use.case';
import { UpdateSessionUseCase } from './sessions/application/use-cases/update.session.use.case';
import { RemoveSessionUseCase } from './sessions/application/use-cases/remove.session.use.case';
import { RemoveSessionWithoutCurrentUseCase } from './sessions/application/use-cases/remove.sessions.without.current.use.case';
import { RemoveSessionByDeviceIdUseCase } from './sessions/application/use-cases/remove.session.by.device.id.use.case';
import { BloggerBlogsController } from './blogger/blogs/api/blogger.blogs.controller';
import { SuperAdminBlogsController } from './superadmin/blogs/api/superadmin.blogs.controller';
import { SuperAdminUsersController } from './superadmin/users/api/superadmin.users.controller';
import { BloggerBlogsQueryRepository } from './blogger/blogs/infrastructure/blogger.blogs.query.repository';
import { SqlSuperAdminBlogsQueryRepository } from './superadmin/blogs/infrastructure/superadmin.blogs.query.repository';
import { BindWithUserUseCase } from './superadmin/blogs/application/use-cases/bind.with.user.use.case';
import { BanUserUseCase } from './superadmin/users/application/use-cases/ban.user.use.case';
import { CommentsAndLikesRepository } from './comments/infrastructure/comments.and.likes.repository';
import { BloggerCommentsQueryRepository } from './blogger/blogs/infrastructure/blogger.comments.query.repository';
import { BloggerUsersController } from './blogger/users/api/blogger.users.controller';
import { SqlBloggerUsersQueryRepository } from './blogger/users/infrastructure/blogger.users.query.repository';
import { BloggerBanUserUseCase } from './blogger/users/application/use-cases/blogger.ban.user.user.case';
import { BanBlogUseCase } from './superadmin/blogs/application/use-cases/ban.blog.use.case';
import { BloggerPostsQueryRepository } from './blogger/blogs/infrastructure/blogger.posts.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqlUsersRepository } from './users/infrastructure/sql.users.repository';
import { SqlSuperAdminUsersQueryRepository } from './superadmin/users/infrastructure/sql.superadmin.users.query.repository';
import { SqlUsersQueryRepository } from './auth/infrastructure/sql.users.query.respository';
import { SqlSessionsRepository } from './sessions/infrastructure/sql.sessions.repository';
import { SqlSessionsQueryRepository } from './sessions/infrastructure/sql.sessions.query.repository';
import { SqlBlogsRepository } from './blogs/infrastructure/sql.blogs.repository';
import { SqlBloggerBlogsQueryRepository } from './blogger/blogs/infrastructure/sql.blogger.blogs.query.repository';
import { SqlBlogsQueryRepository } from './blogs/infrastructure/sql.blogs.query.repository';
import { SqlBloggerPostsQueryRepository } from './blogger/blogs/infrastructure/sql.blogger.posts.query.repository';
import { SqlPostsQueryRepository } from './posts/infrastructure/sql.posts.query.repository';
import { SqlPostsRepository } from './posts/infrastructure/sql.posts.repository';
import { BlogsUsersBanRepository } from './blogger/users/infrastructure/blogs.users.ban.repository';
import { SqlCommentsRepository } from './comments/infrastructure/sql.comments.repository';
import { SqlCommentsQueryRepository } from './comments/infrastructure/sql.comments.query.repository';
import { SqlBloggerCommentsQueryRepository } from './blogger/blogs/infrastructure/sql.blogger.comments.query.repository';
import { SqlCommentLikesRepository } from './comment-likes/infrastructure/sql.comment.likes.repository';

const useCases = [
  RegistrationUserUseCase,
  ConfirmEmailUseCase,
  ValidateUserInLoginUseCase,
  ResendEmailConfirmationUseCase,
  RecoveryPasswordUseCase,
  SetNewPasswordUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  RemoveBlogUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  RemoveCommentUseCase,
  UpdateLikeStatusInCommentUseCase,
  CreatePostInBlogUseCase,
  UpdatePostUseCase,
  RemovePostUseCase,
  UpdateStatusLikeInPostUseCase,
  CreateUserUseCase,
  RemoveUserUseCase,
  CreateUserUseCase,
  CreateSessionUseCase,
  UpdateSessionUseCase,
  RemoveSessionUseCase,
  RemoveSessionWithoutCurrentUseCase,
  RemoveSessionByDeviceIdUseCase,
  BindWithUserUseCase,
  BanUserUseCase,
  BloggerBanUserUseCase,
  BanBlogUseCase
];
const services = [
  JwtAdapter,
  JwtService,
  ConfigService,
  EmailManager,
  EmailService,
  TestingService
];
const repositories = [
  SessionsRepository,
  BlogsRepository,
  PostsRepository,
  UsersRepository,
  PostLikesRepository,
  CommentsRepository,
  CommentLikesRepository,
  CommentsAndLikesRepository,
  BlogsUsersBanRepository
];

const sql = [
  SqlSuperAdminUsersQueryRepository,
  SqlUsersRepository,
  SqlUsersQueryRepository,
  SqlSessionsRepository,
  SqlSessionsQueryRepository,
  SqlBlogsRepository,
  SqlBloggerBlogsQueryRepository,
  SqlBlogsQueryRepository,
  SqlBloggerPostsQueryRepository,
  SqlPostsQueryRepository,
  SqlPostsRepository,
  SqlCommentsRepository,
  SqlCommentsQueryRepository,
  SqlBloggerCommentsQueryRepository,
  SqlCommentLikesRepository
];

const queryRepositories = [
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  SessionsQueryRepository,
  BloggerBlogsQueryRepository,
  SqlSuperAdminBlogsQueryRepository,
  BloggerCommentsQueryRepository,
  SqlBloggerUsersQueryRepository,
  BloggerPostsQueryRepository
];
const decorators = [
  IsBlogIdConstraint,
  EmailNotExistConstraint,
  EmailExistAndDontConfirmedConstraint,
  LoginExistConstraint,
  EmailConfirmationCodeIsCorrectConstraint,
  PasswordRecoveryCodeIsCorrectConstraint,
  CheckIdAndParseToDBId,
  CheckId
];
const strategies = [JwtStrategy, BasicStrategy];

const controllers = [
  AuthController,
  BlogsController,
  CommentsController,
  PostsController,
  SecurityDevicesController,
  TestingController,
  BloggerBlogsController,
  SuperAdminBlogsController,
  SuperAdminUsersController,
  BloggerUsersController
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
      {
        dbName: process.env.DB_NAME || 'service'
      }
    ),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: CommentLike.name, schema: CommentLikeSchema }
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT, 10),
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      ssl: process.env.PG_SSL == 'true',
      autoLoadEntities: false,
      synchronize: false
    }),
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.THROTTLE_TTL, 10),
      limit: parseInt(process.env.THROTTLE_LIMIT, 10)
    }),
    PassportModule,
    CqrsModule
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...repositories,
    ...queryRepositories,
    ...decorators,
    ...strategies,
    ...useCases,
    ...sql
  ]
})
export class AppModule {}
