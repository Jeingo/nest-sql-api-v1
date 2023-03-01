import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { InputUpdateBlogDto } from '../../api/dto/input.update.blog.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlBlogRepository } from '../../../../blogs/infrastructure/sql.blog.repository';

export class UpdateBlogCommand {
  constructor(
    public id: SqlDbId,
    public updateBlogDto: InputUpdateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(private readonly sqlBlogRepository: SqlBlogRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blogId = command.id;
    const { userId } = command.user;
    const blog = await this.sqlBlogRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId.toString() !== userId) throw new ForbiddenException();
    await this.sqlBlogRepository.update(blogId, name, description, websiteUrl);
    return true;
  }
}
