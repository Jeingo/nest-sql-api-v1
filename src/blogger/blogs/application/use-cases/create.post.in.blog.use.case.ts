import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InputCreatePostInBlogsDto } from '../../api/dto/input.create.post.dto';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';

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
    private readonly postsRepository: PostsRepository,
    private readonly blogRepository: BlogsRepository
  ) {}

  async execute(command: CreatePostInBlogCommand): Promise<SqlDbId> {
    const { title, shortDescription, content } = command.createPostDto;
    const blogId = command.blogId;
    const { userId } = command.user;
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (!blog.isOwner(userId)) throw new ForbiddenException();
    const post = this.postsRepository.create(
      title,
      shortDescription,
      content,
      blogId
    );
    await this.postsRepository.save(post);
    return post.id.toString();
  }
}
