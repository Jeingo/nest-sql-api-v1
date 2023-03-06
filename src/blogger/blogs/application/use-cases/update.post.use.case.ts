import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InputUpdatePostDto } from '../../api/dto/input.update.post.dto';
import { PostsRepository } from '../../../../posts/infrastructure/posts-repository.service';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs-repository.service';

export class UpdatePostCommand {
  constructor(
    public id: SqlDbId,
    public updatePostDto: InputUpdatePostDto,
    public blogId: SqlDbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { userId } = command.user;
    const { title, shortDescription, content } = command.updatePostDto;
    const blogId = command.blogId;
    const postId = command.id;
    const blog = await this.blogsRepository.getById(blogId);
    const post = await this.postsRepository.getById(postId);
    if (!post || !blog) throw new NotFoundException();
    if (blog.userId.toString() !== userId || post.blogId.toString() !== blogId)
      throw new ForbiddenException();
    await this.postsRepository.update(postId, title, shortDescription, content);
    return true;
  }
}
