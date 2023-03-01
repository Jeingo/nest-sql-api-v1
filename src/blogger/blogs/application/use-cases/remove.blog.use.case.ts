import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlBlogRepository } from '../../../../blogs/infrastructure/sql.blog.repository';

export class RemoveBlogCommand {
  constructor(public id: SqlDbId, public user: CurrentUserType) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogUseCase {
  constructor(private readonly sqlBlogRepository: SqlBlogRepository) {}

  async execute(command: RemoveBlogCommand): Promise<boolean> {
    const { userId } = command.user;
    const blogId = command.id;
    const blog = await this.sqlBlogRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId.toString() !== userId) throw new ForbiddenException();
    await this.sqlBlogRepository.delete(blogId);
    return true;
  }
}
