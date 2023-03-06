import {
  Controller,
  Get,
  Param,
  HttpCode,
  Query,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { OutputBlogDto } from './dto/output.blog.dto';
import { QueryBlogs } from './types/query.blogs.type';
import { QueryPosts } from '../../posts/api/types/query.posts.type';
import { OutputPostDto } from '../../posts/api/dto/output.post.dto';
import { GetUserGuard } from '../../auth/infrastructure/guards/get.user.guard';
import { CheckId } from '../../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../../helper/get-decorators/current.user.decorator';
import {
  CurrentUserType,
  PaginatedType,
  SqlDbId
} from '../../global-types/global.types';
import { BlogsQueryRepository } from '../infrastructure/blogs-query-repository.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts-query-repository.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly sqlBlogsQueryRepository: BlogsQueryRepository,
    private readonly sqlPostsQueryRepository: PostsQueryRepository
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
    @Param('id', new CheckId()) id: SqlDbId
  ): Promise<OutputBlogDto> {
    return await this.sqlBlogsQueryRepository.getById(id);
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':blogId/posts')
  async findAllPostsByBlogId(
    @Query() query: QueryPosts,
    @Param('blogId', new CheckId()) blogId: SqlDbId,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputPostDto>> {
    return await this.sqlPostsQueryRepository.getAllByBlogId(
      query,
      blogId,
      user
    );
  }
}
