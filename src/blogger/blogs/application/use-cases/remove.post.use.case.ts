import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../../../posts/infrastructure/posts-repository.service';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs-repository.service';

export class RemovePostCommand {
  constructor(
    public id: SqlDbId,
    public blogId: SqlDbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(RemovePostCommand)
export class RemovePostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogRepository: BlogsRepository
  ) {}

  async execute(command: RemovePostCommand): Promise<boolean> {
    const { userId } = command.user;
    const blogId = command.blogId;
    const postId = command.id;
    const blog = await this.blogRepository.getById(blogId);
    const post = await this.postsRepository.getById(postId);
    if (!post || !blog) throw new NotFoundException();
    if (blog.userId.toString() !== userId || post.blogId.toString() !== blogId)
      throw new ForbiddenException();
    await this.postsRepository.delete(postId);
    return true;
  }
}
