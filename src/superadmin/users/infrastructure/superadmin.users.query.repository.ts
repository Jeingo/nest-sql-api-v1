import { Injectable, NotFoundException } from '@nestjs/common';
import { BanStatus, QueryUsers } from '../api/types/query.users.type';
import { OutputSuperAdminUserDto } from '../api/dto/outputSuperAdminUserDto';
import {
  Direction,
  PaginatedType,
  SqlDbId
} from '../../../global-types/global.types';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../../users/domain/users.entity';

@Injectable()
export class SuperAdminUsersQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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
    const banFilter = this.getBanFilter(banStatus);

    const queryString = `SELECT * FROM "Users"
                         WHERE ${banFilter}
                         (login ILIKE '%${searchLoginTerm}%'
                         OR email ILIKE '%${searchEmailTerm}%')
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(*) FROM "Users"
                                  WHERE ${banFilter}
                                  (login ILIKE '%${searchLoginTerm}%'
                                  OR email ILIKE '%${searchEmailTerm}%')`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    const mappedUser = result.map(this.getOutputUserSql);
    return getPaginatedType(
      mappedUser,
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
  async getById(id: SqlDbId): Promise<OutputSuperAdminUserDto> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=${id}`
    );
    if (!result[0]) throw new NotFoundException();
    return this.getOutputUserSql(result[0]);
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
        banReason: user.banReason
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
