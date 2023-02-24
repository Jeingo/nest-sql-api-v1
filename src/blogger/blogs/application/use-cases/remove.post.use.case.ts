import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, DbId } from '../../../../global-types/global.types';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';

export class RemovePostCommand {
  constructor(
    public id: DbId,
    public blogId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(RemovePostCommand)
export class RemovePostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: RemovePostCommand): Promise<boolean> {
    const { userId } = command.user;
    const blogId = command.blogId;
    const postId = command.id;
    const blog = await this.blogsRepository.getById(blogId);
    const post = await this.postsRepository.getById(postId);
    if (!post || !blog) throw new NotFoundException();
    if (
      blog.blogOwnerInfo.userId !== userId ||
      post.postOwnerInfo.userId !== userId
    )
      throw new ForbiddenException();
    await this.postsRepository.delete(postId);
    return true;
  }
}
