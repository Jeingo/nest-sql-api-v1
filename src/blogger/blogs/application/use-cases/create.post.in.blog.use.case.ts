import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, DbId } from '../../../../global-types/global.types';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InputCreatePostInBlogsDto } from '../../api/dto/input.create.post.dto';

export class CreatePostInBlogCommand {
  constructor(
    public createPostDto: InputCreatePostInBlogsDto,
    public blogId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreatePostInBlogCommand)
export class CreatePostInBlogUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: CreatePostInBlogCommand): Promise<DbId> {
    const { title, shortDescription, content } = command.createPostDto;
    const blogId = command.blogId;
    const { userId } = command.user;
    const foundBlog = await this.blogsRepository.getById(blogId);
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException();
    const createdPost = this.postsRepository.create(
      title,
      shortDescription,
      content,
      blogId.toString(),
      foundBlog.name,
      userId
    );
    await this.postsRepository.save(createdPost);
    return createdPost._id;
  }
}
