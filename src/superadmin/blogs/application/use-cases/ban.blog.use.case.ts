import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../../global-types/global.types';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { InputBanBlogDto } from '../../api/dto/input.ban.blog.dto';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';

export class BanBlogCommand {
  constructor(public blogId: DbId, public banBlogDto: InputBanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  async execute(command: BanBlogCommand): Promise<boolean> {
    const blogId = command.blogId;
    const { isBanned } = command.banBlogDto;
    const blog = await this.blogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException();

    const posts = await this.postsRepository.getByBlogId(blogId.toString());

    blog.banBlog(isBanned);
    posts.map((doc) => doc.banFromBlog(isBanned));

    await this.blogsRepository.save(blog);
    posts.map(async (doc) => await this.postsRepository.save(doc));
    return true;
  }
}
