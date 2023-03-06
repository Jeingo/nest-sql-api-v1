import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InputCreatePostInBlogsDto } from '../../api/dto/input.create.post.dto';
import { PostsRepository } from '../../../../posts/infrastructure/posts-repository.service';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs-repository.service';

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
    private readonly sqlPostsRepository: PostsRepository,
    private readonly sqlBlogRepository: BlogsRepository
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
