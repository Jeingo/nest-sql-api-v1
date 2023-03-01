import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InputCreatePostInBlogsDto } from '../../api/dto/input.create.post.dto';
import { SqlPostsRepository } from '../../../../posts/infrastructure/sql.posts.repository';
import { SqlBlogsRepository } from '../../../../blogs/infrastructure/sql.blogs.repository';

export class CreatePostInBlogCommand {
  constructor(
    public createPostDto: InputCreatePostInBlogsDto,
    public blogId: SqlDbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreatePostInBlogCommand)
export class CreatePostInBlogUseCase {
  constructor(
    private readonly sqlPostsRepository: SqlPostsRepository,
    private readonly sqlBlogRepository: SqlBlogsRepository
  ) {}

  async execute(command: CreatePostInBlogCommand): Promise<SqlDbId> {
    const { title, shortDescription, content } = command.createPostDto;
    const blogId = command.blogId;
    const { userId } = command.user;
    const foundBlog = await this.sqlBlogRepository.getById(blogId);
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.userId.toString() !== userId) throw new ForbiddenException();
    const createdPost = await this.sqlPostsRepository.create(
      title,
      shortDescription,
      content,
      blogId
    );
    return createdPost.id.toString();
  }
}
