import { Injectable, NotFoundException } from '@nestjs/common';
import { OutputBlogDto } from '../api/dto/output.blog.dto';
import { QueryBlogs } from '../api/types/query.blogs.type';
import { getPaginatedType } from '../../helper/query/query.repository.helper';
import {
  Direction,
  PaginatedType,
  SqlDbId
} from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blogs.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected readonly dataSource: DataSource) {}

  async getAll(query: QueryBlogs): Promise<PaginatedType<OutputBlogDto>> {
    const {
      searchNameTerm = '',
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT b.* FROM "Blogs" b
                         LEFT JOIN "Users" u ON b."userId"=u.id
                         WHERE
                         b."isBanned"=false
                         AND
                         u."isBanned"=false
                         AND
                         b.name ILIKE '%${searchNameTerm}%'
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(b.*) FROM "Blogs" b
                                  LEFT JOIN "Users" u ON b."userId"=u.id
                                  WHERE
                                  b."isBanned"=false
                                  AND
                                  u."isBanned"=false
                                  AND
                                  b.name ILIKE '%${searchNameTerm}%'`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    return getPaginatedType(
      result.map(this.sqlGetOutputBlogDto),
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
  async getById(id: SqlDbId): Promise<OutputBlogDto> {
    const result = await this.dataSource.query(
      `SELECT b.*
             FROM "Blogs" b 
             LEFT JOIN "Users" u ON b."userId"=u.id 
             WHERE 
             b.id=${id}
             AND
             b."isBanned"=false
             AND
             u."isBanned"=false`
    );
    if (!result[0]) throw new NotFoundException();
    return this.sqlGetOutputBlogDto(result[0]);
  }
  protected sqlGetOutputBlogDto(blog: Blog): OutputBlogDto {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership
    };
  }
}
