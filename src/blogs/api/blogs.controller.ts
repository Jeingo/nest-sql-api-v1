import {
  Controller,
  Get,
  Param,
  HttpCode,
  Query,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { OutputBlogDto } from './dto/output.blog.dto';
import { QueryBlogs } from './types/query.blogs.type';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { QueryPosts } from '../../posts/api/types/query.posts.type';
import { OutputPostDto } from '../../posts/api/dto/output.post.dto';
import { GetUserGuard } from '../../auth/infrastructure/guards/get.user.guard';
import { CheckIdAndParseToDBId } from '../../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../../helper/get-decorators/current.user.decorator';
import {
  CurrentUserType,
  DbId,
  PaginatedType
} from '../../global-types/global.types';
import { SqlBlogsQueryRepository } from '../infrastructure/sql.blogs.query.repository';
import { SqlPostsQueryRepository } from '../../posts/infrastructure/sql.posts.query.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly sqlBlogsQueryRepository: SqlBlogsQueryRepository,
    private readonly sqlPostsQueryRepository: SqlPostsQueryRepository
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryBlogs
  ): Promise<PaginatedType<OutputBlogDto>> {
    return await this.sqlBlogsQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId
  ): Promise<OutputBlogDto> {
    return await this.blogsQueryRepository.getById(id);
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':blogId/posts')
  async findAllPostsByBlogId(
    @Query() query: QueryPosts,
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputPostDto>> {
    return await this.postsQueryRepository.getAllByBlogId(query, blogId, user);
  }
}
