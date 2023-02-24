import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, DbId } from '../../../../global-types/global.types';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InputUpdatePostDto } from '../../api/dto/input.update.post.dto';

export class UpdatePostCommand {
  constructor(
    public id: DbId,
    public updatePostDto: InputUpdatePostDto,
    public blogId: DbId,
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
    if (
      blog.blogOwnerInfo.userId !== userId ||
      post.postOwnerInfo.userId !== userId
    )
      throw new ForbiddenException();
    post.update(title, shortDescription, content, blogId.toString(), blog.name);
    await this.postsRepository.save(post);
    return true;
  }
}
