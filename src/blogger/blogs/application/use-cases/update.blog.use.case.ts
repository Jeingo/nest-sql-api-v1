import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { InputUpdateBlogDto } from '../../api/dto/input.update.blog.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public id: SqlDbId,
    public updateBlogDto: InputUpdateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blogId = command.id;
    const { userId } = command.user;
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (!blog.isOwner(userId)) throw new ForbiddenException();
    blog.update(name, description, websiteUrl);
    await this.blogRepository.save(blog);
    return true;
  }
}
