import { CommandHandler } from '@nestjs/cqrs';
import { SqlDbId } from '../../../../global-types/global.types';
import { InputBanBlogDto } from '../../api/dto/input.ban.blog.dto';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs-repository.service';

export class BanBlogCommand {
  constructor(public blogId: SqlDbId, public banBlogDto: InputBanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(private readonly sqlBlogsRepository: BlogsRepository) {}

  async execute(command: BanBlogCommand): Promise<boolean> {
    const blogId = command.blogId;
    const { isBanned } = command.banBlogDto;
    const blog = await this.sqlBlogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    await this.sqlBlogsRepository.banBlog(blogId, isBanned);
    return true;
  }
}
