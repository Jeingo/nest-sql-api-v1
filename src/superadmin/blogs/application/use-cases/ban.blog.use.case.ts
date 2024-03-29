import { CommandHandler } from '@nestjs/cqrs';
import { SqlDbId } from '../../../../global-types/global.types';
import { InputBanBlogDto } from '../../api/dto/input.ban.blog.dto';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';

export class BanBlogCommand {
  constructor(public blogId: SqlDbId, public banBlogDto: InputBanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: BanBlogCommand): Promise<boolean> {
    const blogId = command.blogId;
    const { isBanned } = command.banBlogDto;
    const blog = await this.blogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    blog.ban(isBanned);
    await this.blogsRepository.save(blog);
    return true;
  }
}
