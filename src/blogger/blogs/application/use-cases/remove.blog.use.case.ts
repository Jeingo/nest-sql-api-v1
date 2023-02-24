import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { CurrentUserType, DbId } from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class RemoveBlogCommand {
  constructor(public id: DbId, public user: CurrentUserType) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: RemoveBlogCommand): Promise<boolean> {
    const { userId } = command.user;
    const blogId = command.id;
    const blog = await this.blogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();
    await this.blogsRepository.delete(blogId);
    return true;
  }
}
