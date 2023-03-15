import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { InputBloggerUserBanDto } from '../../api/dto/input.blogger.user.ban.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { BlogsUsersBanRepository } from '../../../../users-blogs-ban/infrastructure/blogs.users.ban.repository';

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
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}

  async execute(command: BloggerBanUserCommand): Promise<boolean> {
    const { isBanned, banReason, blogId } = command.bloggerUserBanDto;
    const { userId } = command.user;
    const bannedUserId = command.userId;

    const blog = await this.blogsRepository.getById(blogId);

    if (!blog) throw new NotFoundException();
    if (!blog.isOwner(userId)) throw new ForbiddenException();

    const user = await this.usersRepository.getById(bannedUserId);
    if (!user) throw new NotFoundException();

    let blogsUsersBan = await this.blogsUsersBanRepository.getByBlogId(
      blogId,
      bannedUserId
    );

    if (!blogsUsersBan) {
      blogsUsersBan = this.blogsUsersBanRepository.create(
        bannedUserId,
        blogId,
        isBanned,
        banReason
      );
    } else {
      blogsUsersBan.update(isBanned, banReason);
    }

    await this.blogsUsersBanRepository.save(blogsUsersBan);

    return true;
  }
}
