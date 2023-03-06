import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { OutputBlogDto } from '../../../blogs/api/dto/output.blog.dto';
import { CreateBlogCommand } from '../application/use-cases/create.blog.use.case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt.auth.guard';
import { CurrentUser } from '../../../helper/get-decorators/current.user.decorator';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import { CheckId } from '../../../helper/pipes/check.id.validator.pipe';
import {
  CurrentUserType,
  PaginatedType,
  SqlDbId
} from '../../../global-types/global.types';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { UpdateBlogCommand } from '../application/use-cases/update.blog.use.case';
import { RemoveBlogCommand } from '../application/use-cases/remove.blog.use.case';
import { InputCreatePostInBlogsDto } from './dto/input.create.post.dto';
import { OutputPostDto } from '../../../posts/api/dto/output.post.dto';
import { CreatePostInBlogCommand } from '../application/use-cases/create.post.in.blog.use.case';
import { UpdatePostCommand } from '../application/use-cases/update.post.use.case';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { RemovePostCommand } from '../application/use-cases/remove.post.use.case';
import { QueryComments } from '../../../comments/api/types/query.comments.type';
import { OutputBloggerCommentsDto } from './dto/output.blogger.comments.dto';
import { SqlBloggerBlogsQueryRepository } from '../infrastructure/sql.blogger.blogs.query.repository';
import { SqlBloggerPostsQueryRepository } from '../infrastructure/sql.blogger.posts.query.repository';
import { SqlBloggerCommentsQueryRepository } from '../infrastructure/sql.blogger.comments.query.repository';

@UseGuards(JwtAuthGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private readonly sqlBloggerBlogsQueryRepository: SqlBloggerBlogsQueryRepository,
    private readonly sqlBloggerPostsQueryRepository: SqlBloggerPostsQueryRepository,
    private readonly sqlBloggerCommentsQueryRepository: SqlBloggerCommentsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createBlogDto: InputCreateBlogDto,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputBlogDto> {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(createBlogDto, user)
    );
    return await this.sqlBloggerBlogsQueryRepository.getById(createdBlogId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryBlogs,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputBlogDto>> {
    return await this.sqlBloggerBlogsQueryRepository.getAllForBlogger(
      query,
      user
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckId()) id: SqlDbId,
    @Body() updateBlogDto: InputUpdateBlogDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new UpdateBlogCommand(id, updateBlogDto, user)
    );
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', new CheckId()) id: SqlDbId,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(new RemoveBlogCommand(id, user));
    return;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId', new CheckId()) blogId: SqlDbId,
    @Body() createPostDto: InputCreatePostInBlogsDto,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputPostDto> {
    const createdPostId = await this.commandBus.execute(
      new CreatePostInBlogCommand(createPostDto, blogId, user)
    );
    return await this.sqlBloggerPostsQueryRepository.getById(createdPostId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:id')
  async updatePost(
    @Param('blogId', new CheckId()) blogId: SqlDbId,
    @Param('id', new CheckId()) id: SqlDbId,
    @Body() updatePostDto: InputUpdatePostDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand(id, updatePostDto, blogId, user)
    );
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/posts/:id')
  async removePost(
    @Param('blogId', new CheckId()) blogId: SqlDbId,
    @Param('id', new CheckId()) id: SqlDbId,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(new RemovePostCommand(id, blogId, user));
    return;
  }

  @HttpCode(HttpStatus.OK)
  @Get('comments')
  async findAllComments(
    @Query() query: QueryComments,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputBloggerCommentsDto>> {
    return await this.sqlBloggerCommentsQueryRepository.getAllForBlogger(
      query,
      user
    );
  }
}
