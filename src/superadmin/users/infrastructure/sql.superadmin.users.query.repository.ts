import { Injectable, NotFoundException } from '@nestjs/common';
import { BanStatus, QueryUsers } from '../api/types/query.users.type';
import { OutputSuperAdminUserDto } from '../api/dto/outputSuperAdminUserDto';
import { Direction, PaginatedType } from '../../../global-types/global.types';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlSuperAdminUsersQueryRepository {
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
                         WHERE login LIKE '%${searchLoginTerm}%'
                         AND email LIKE '%${searchEmailTerm}%'
                         ${banFilter}
                         ORDER BY "${sortBy}" ${sortDirection} 
                         LIMIT ${pageSize} 
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(*) FROM "Users"
                                  WHERE login LIKE '%${searchLoginTerm}%'
                                  AND email LIKE '%${searchEmailTerm}%'
                                  ${banFilter}`;

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
  async getById(id: string): Promise<OutputSuperAdminUserDto> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1`,
      [id]
    );
    if (!result[0]) throw new NotFoundException();
    return this.getOutputUserSql(result[0]);
  }
  private getOutputUserSql(user: any): OutputSuperAdminUserDto {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason
      }
    };
  }

  private getBanFilter(banStatus: BanStatus) {
    if (banStatus === BanStatus.all) {
      return ``;
    }
    if (banStatus === BanStatus.banned) {
      return `AND "isBanned"=true`;
    }
    return `AND "isBanned"=false`;
  }
}
