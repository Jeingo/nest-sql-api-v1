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
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User } from '../../../users/domain/entities/user.entity';
import { Blog, IBlogModel } from '../../../blogs/domain/entities/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersBlogsBanSqlType } from '../../../type-for-sql-entity/users.blogs.ban.sql.type';

@Injectable()
export class SqlBloggerUsersQueryRepository {
  constructor(
    @InjectModel(User.name) protected usersModel: IUserModel,
    @InjectModel(Blog.name) protected blogsModel: IBlogModel,
    @InjectDataSource() protected readonly dataSource: DataSource
  ) {}

  async getBannedUserByBlogId(
    blogId: SqlDbId,
    query: QueryBannedUsers,
    user: CurrentUserType
  ): Promise<PaginatedType<OutputBloggerUserDto>> {
    const blog = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE id=$1;`,
      [blogId]
    );
    if (!blog[0]) throw new NotFoundException();
    if (blog[0].userId.toString() !== user.userId)
      throw new ForbiddenException();
    const {
      searchLoginTerm = '',
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT ub.*,u.login, u.id AS "userId"
                         FROM "Users_Blogs_Ban" ub
                         LEFT JOIN "Users" u ON ub."userId"=u.id
                         WHERE ub."blogId"=${blogId}
                         AND u."isBanned"=false
                         AND u.login ILIKE '%${searchLoginTerm}%'
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(ub.*)
                                  FROM "Users_Blogs_Ban" ub
                                  LEFT JOIN "Users" u ON ub."userId"=u.id
                                  WHERE ub."blogId"=${blogId}
                                  AND u."isBanned"=false
                                  AND u.login ILIKE '%${searchLoginTerm}%'`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    const mappedResult = this._getOutputBannedUserDto(result);

    return getPaginatedType(
      mappedResult,
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }

  protected _getOutputBannedUserDto(
    usersBlogsBan: (UsersBlogsBanSqlType & { login: string; userId: number })[]
  ): OutputBloggerUserDto[] {
    return usersBlogsBan.map((uub) => {
      return {
        id: uub.userId.toString(),
        login: uub.login,
        banInfo: {
          isBanned: true,
          banDate: uub.banDate.toISOString(),
          banReason: uub.banReason
        }
      };
    });
  }
}
