import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs-repository.service';

export class RemoveBlogCommand {
  constructor(public id: SqlDbId, public user: CurrentUserType) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogUseCase {
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(command: RemoveBlogCommand): Promise<boolean> {
    const { userId } = command.user;
    const blogId = command.id;
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId.toString() !== userId) throw new ForbiddenException();
    await this.blogRepository.delete(blogId);
    return true;
  }
}
