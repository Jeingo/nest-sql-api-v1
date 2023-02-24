import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { CurrentUserType, DbId } from '../../../../global-types/global.types';
import { InputUpdateBlogDto } from '../../api/dto/input.update.blog.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public id: DbId,
    public updateBlogDto: InputUpdateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blogId = command.id;
    const { userId } = command.user;
    const blog = await this.blogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();
    blog.update(name, description, websiteUrl);
    await this.blogsRepository.save(blog);
    return true;
  }
}
