import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  CurrentUserType,
  Direction,
  PaginatedType,
  SqlDbId
} from '../../../global-types/global.types';
import { OutputBloggerUserDto } from '../api/dto/output.blogger.user.dto';
import { QueryBannedUsers } from '../api/types/query.banned.users.type';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBlogBan } from '../../../users-blogs-ban/domain/users.blogs.ban.entity';
import { Blog } from '../../../blogs/domain/blogs.entity';
import { User } from '../../../users/domain/users.entity';

@Injectable()
export class BloggerUsersQueryRepository {
  constructor(
    @InjectRepository(UserBlogBan)
    private userBlogBansRepository: Repository<UserBlogBan>,
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>
  ) {}

  async getBannedUserByBlogId(
    blogId: SqlDbId,
    query: QueryBannedUsers,
    user: CurrentUserType
  ): Promise<PaginatedType<OutputBloggerUserDto>> {
    const blog = await this.blogsRepository.findOneBy({ id: +blogId });
    if (!blog) throw new NotFoundException();
    if (!blog.isOwner(user.userId)) throw new ForbiddenException();

    const {
      searchLoginTerm = '',
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;
    const direction = sortDirection.toUpperCase() as Direction;

    const [blogUserBan, count] = await this.userBlogBansRepository
      .createQueryBuilder('bub')
      .leftJoinAndSelect('bub.user', 'u')
      .where('bub."blogId"=:blogId', { blogId: +blogId })
      .andWhere('u."isBanned"=false')
      .andWhere(`u.login ILIKE :searchLoginTerm`, {
        searchLoginTerm: `%${searchLoginTerm}%`
      })
      .orderBy(`u."${sortBy}"`, direction)
      .limit(+pageSize)
      .offset(skipNumber)
      .getManyAndCount();

    const mappedResult = blogUserBan.map(this.getOutputBannedUserDto);

    return getPaginatedType(mappedResult, +pageSize, +pageNumber, count);
  }

  protected getOutputBannedUserDto(
    usersBlogsBan: UserBlogBan & { user: User }
  ): OutputBloggerUserDto {
    return {
      id: usersBlogsBan.userId.toString(),
      login: usersBlogsBan.user.login,
      banInfo: {
        isBanned: true,
        banDate: usersBlogsBan.banDate.toISOString(),
        banReason: usersBlogsBan.banReason
      }
    };
  }
}
