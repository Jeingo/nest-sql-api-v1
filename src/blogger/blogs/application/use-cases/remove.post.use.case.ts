import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlPostsRepository } from '../../../../posts/infrastructure/sql.posts.repository';
import { SqlBlogsRepository } from '../../../../blogs/infrastructure/sql.blogs.repository';

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
    private readonly sqlPostsRepository: SqlPostsRepository,
    private readonly sqlBlogRepository: SqlBlogsRepository
  ) {}

  async execute(command: RemovePostCommand): Promise<boolean> {
    const { userId } = command.user;
    const blogId = command.blogId;
    const postId = command.id;
    const blog = await this.sqlBlogRepository.getById(blogId);
    const post = await this.sqlPostsRepository.getById(postId);
    if (!post || !blog) throw new NotFoundException();
    if (blog.userId.toString() !== userId || post.blogId.toString() !== blogId)
      throw new ForbiddenException();
    await this.sqlPostsRepository.delete(postId);
    return true;
  }
}
