import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { InputBloggerUserBanDto } from '../../api/dto/input.blogger.user.ban.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlUsersRepository } from '../../../../users/infrastructure/sql.users.repository';
import { SqlBlogsRepository } from '../../../../blogs/infrastructure/sql.blogs.repository';
import { BlogsUsersBanRepository } from '../../infrastructure/blogs.users.ban.repository';

export class BloggerBanUserCommand {
  constructor(
    public bloggerUserBanDto: InputBloggerUserBanDto,
    public userId: SqlDbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase {
  constructor(
    private readonly sqlUsersRepository: SqlUsersRepository,
    private readonly sqlBlogsRepository: SqlBlogsRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}

  async execute(command: BloggerBanUserCommand): Promise<boolean> {
    const { isBanned, banReason, blogId } = command.bloggerUserBanDto;
    const { userId } = command.user;
    const bannedUserId = command.userId;
    const blog = await this.sqlBlogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId.toString() !== userId) throw new ForbiddenException();

    const user = await this.sqlUsersRepository.getById(bannedUserId);
    if (!user) throw new NotFoundException();

    await this.blogsUsersBanRepository.ban(
      bannedUserId,
      blogId,
      isBanned,
      banReason
    );

    return true;
  }
}
