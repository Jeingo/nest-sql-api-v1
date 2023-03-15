import { Injectable, NotFoundException } from '@nestjs/common';
import { BanStatus, QueryUsers } from '../api/types/query.users.type';
import { OutputSuperAdminUserDto } from '../api/dto/outputSuperAdminUserDto';
import {
  Direction,
  PaginatedType,
  SqlDbId
} from '../../../global-types/global.types';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/domain/users.entity';

@Injectable()
export class SuperAdminUsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async getAll(
    query: QueryUsers
  ): Promise<PaginatedType<OutputSuperAdminUserDto>> {
    const {
      banStatus = BanStatus.all,
      searchLoginTerm = '',
      searchEmailTerm = '',
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;
    const direction = sortDirection.toUpperCase() as Direction;
    const banFilter = this.getBanFilter(banStatus);

    const [users, count] = await this.usersRepository
      .createQueryBuilder()
      .where(
        `${banFilter} (login ILIKE :searchLoginTerm OR email ILIKE :searchEmailTerm)`,
        {
          searchLoginTerm: `%${searchLoginTerm}%`,
          searchEmailTerm: `%${searchEmailTerm}%`
        }
      )
      .orderBy(`"${sortBy}"`, direction)
      .limit(+pageSize)
      .offset(skipNumber)
      .getManyAndCount();

    const mappedUser = users.map(this.getOutputUserSql);
    return getPaginatedType(mappedUser, +pageSize, +pageNumber, count);
  }
  async getById(id: SqlDbId): Promise<OutputSuperAdminUserDto> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .where('id=:id', { id: +id })
      .getOne();
    if (!result) throw new NotFoundException();
    return this.getOutputUserSql(result);
  }
  private getOutputUserSql(user: User): OutputSuperAdminUserDto {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate ? user.banDate.toISOString() : null,
        banReason: user.banReason ? user.banReason : null
      }
    };
  }

  private getBanFilter(banStatus: BanStatus) {
    if (banStatus === BanStatus.all) {
      return ``;
    }
    if (banStatus === BanStatus.banned) {
      return `"isBanned"=true AND`;
    }
    return `"isBanned"=false AND`;
  }
}
