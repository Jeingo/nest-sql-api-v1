import { Injectable } from '@nestjs/common';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import {
  CurrentUserType,
  Direction,
  PaginatedType
} from '../../../global-types/global.types';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { OutputBlogDto } from '../../../blogs/api/dto/output.blog.dto';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';

@Injectable()
export class BloggerBlogsQueryRepository extends BlogsQueryRepository {
  async getAllForBlogger(
    query: QueryBlogs,
    user: CurrentUserType
  ): Promise<PaginatedType<OutputBlogDto>> {
    const {
      searchNameTerm = '',
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT * FROM "Blogs"
                         WHERE
                         "userId"=${user.userId}
                         AND
                         name ILIKE '%${searchNameTerm}%'
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(*) FROM "Blogs"
                                  WHERE
                                  "userId"=${user.userId}
                                  AND
                                  name ILIKE '%${searchNameTerm}%'`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    return getPaginatedType(
      result.map(this.sqlGetOutputBlogDto),
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
}
