import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth/api/auth.controller';
import { JwtAdapter } from './adapters/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { EmailManager } from './adapters/email/email.manager';
import { EmailService } from './adapters/email/email.service';
import { BlogsController } from './blogs/api/blogs.controller';
import { CommentsController } from './comments/api/comments.controller';
import { PostsController } from './posts/api/posts.controller';
import { SecurityDevicesController } from './sessions/api/security.devices.controller';
import { TestingController } from './testing/api/testing.controller';
import { TestingService } from './testing/application/testing.service';
import { CheckId } from './helper/pipes/check.id.validator.pipe';
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
import { SuperAdminBlogsQueryRepository } from './superadmin/blogs/infrastructure/superadmin.blogs.query.repository';
import { BindWithUserUseCase } from './superadmin/blogs/application/use-cases/bind.with.user.use.case';
import { BanUserUseCase } from './superadmin/users/application/use-cases/ban.user.use.case';
import { BloggerUsersController } from './blogger/users/api/blogger.users.controller';
import { BloggerUsersQueryRepository } from './blogger/users/infrastructure/blogger.users.query.repository';
import { BloggerBanUserUseCase } from './blogger/users/application/use-cases/blogger.ban.user.user.case';
import { BanBlogUseCase } from './superadmin/blogs/application/use-cases/ban.blog.use.case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './users/infrastructure/users.repository';
import { SuperAdminUsersQueryRepository } from './superadmin/users/infrastructure/superadmin.users.query.repository';
import { UsersQueryRepository } from './auth/infrastructure/users.query.respository';
import { SessionsRepository } from './sessions/infrastructure/sessions.repository';
import { SessionsQueryRepository } from './sessions/infrastructure/sessions.query.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BloggerBlogsQueryRepository } from './blogger/blogs/infrastructure/blogger.blogs.query.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query.repository';
import { BloggerPostsQueryRepository } from './blogger/blogs/infrastructure/blogger.posts.query.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query.repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BlogsUsersBanRepository } from './users-blogs-ban/infrastructure/blogs.users.ban.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query.repository';
import { BloggerCommentsQueryRepository } from './blogger/blogs/infrastructure/blogger.comments.query.repository';
import { CommentLikesRepository } from './comment-likes/infrastructure/comment.likes.repository';
import { PostLikesRepository } from './post-likes/infrastructure/post.likes.repository';
import { User } from './users/domain/users.entity';
import { Session } from './sessions/domain/session.entity';
import { Blog } from './blogs/domain/blogs.entity';
import { Post } from './posts/domain/posts.entity';
import { Comment } from './comments/domain/comments.entity';
import { UserBlogBan } from './users-blogs-ban/domain/users.blogs.ban.entity';
import { CommentLike } from './comment-likes/domain/comment.likes.entity';
import { PostLike } from './post-likes/domain/post.likes.entity';
import { QuizController } from './quiz/api/quiz.controller';
import { QuizQueryRepository } from './quiz/infrastructure/quiz.query.repository';
import { QuizRepository } from './quiz/infrastructure/quiz.repository';
import { CreateQuizUseCase } from './quiz/application/use-cases/create.quiz.use.case';
import { Quiz } from './quiz/domain/quiz.entity';

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
  BanBlogUseCase,
  CreateQuizUseCase
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
  BlogsUsersBanRepository,
  UsersRepository,
  SessionsRepository,
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  CommentLikesRepository,
  PostLikesRepository,
  QuizRepository
];

const queryRepositories = [
  UsersQueryRepository,
  SessionsQueryRepository,
  SuperAdminUsersQueryRepository,
  SuperAdminBlogsQueryRepository,
  BloggerUsersQueryRepository,
  BloggerBlogsQueryRepository,
  BloggerPostsQueryRepository,
  BloggerCommentsQueryRepository,
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  QuizQueryRepository
];
const decorators = [
  EmailNotExistConstraint,
  EmailExistAndDontConfirmedConstraint,
  LoginExistConstraint,
  EmailConfirmationCodeIsCorrectConstraint,
  PasswordRecoveryCodeIsCorrectConstraint,
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
  SuperAdminBlogsController,
  SuperAdminUsersController,
  BloggerUsersController,
  BloggerBlogsController,
  QuizController
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT, 10),
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      ssl: process.env.PG_SSL == 'true',
      autoLoadEntities: true,
      synchronize: true
    }),
    TypeOrmModule.forFeature([
      Blog,
      User,
      Session,
      Post,
      Comment,
      CommentLike,
      PostLike,
      UserBlogBan,
      Quiz
    ]),
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
    ...useCases
  ]
})
export class AppModule {}
