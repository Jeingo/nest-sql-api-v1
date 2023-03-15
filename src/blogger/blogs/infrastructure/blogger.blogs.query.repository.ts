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
    const direction = sortDirection.toUpperCase() as Direction;

    const [blogs, count] = await this.blogsRepository
      .createQueryBuilder()
      .where('"userId"=:userId', { userId: +user.userId })
      .andWhere(`name ILIKE :searchNameTerm`, {
        searchNameTerm: `%${searchNameTerm}%`
      })
      .orderBy(`"${sortBy}"`, direction)
      .limit(+pageSize)
      .offset(skipNumber)
      .getManyAndCount();

    return getPaginatedType(
      blogs.map(this.sqlGetOutputBlogDto),
      +pageSize,
      +pageNumber,
      count
    );
  }
}
