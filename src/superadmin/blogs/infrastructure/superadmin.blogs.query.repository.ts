import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from '../../../blogs/domain/entities/blog.entity';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import { OutputSuperAdminBlogDto } from '../api/dto/output.superadmin.blog.dto';
import { Direction, PaginatedType } from '../../../global-types/global.types';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsSqlType } from '../../../type-for-sql-entity/blogs.sql.type';

@Injectable()
export class SqlSuperAdminBlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
    @InjectDataSource() protected readonly dataSource: DataSource
  ) {}

  async getAll(
    query: QueryBlogs
  ): Promise<PaginatedType<OutputSuperAdminBlogDto>> {
    const {
      searchNameTerm = '',
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT b.*,
                         u.login
                         FROM "Blogs" b
                         LEFT JOIN "Users" u ON b."userId"=u.id
                         WHERE
                         b.name ILIKE '%${searchNameTerm}%'
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(b.*)
                                  FROM "Blogs" b
                                  LEFT JOIN "Users" u ON b."userId"=u.id
                                  WHERE
                                  b.name ILIKE '%${searchNameTerm}%'`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    console.log(result);

    return getPaginatedType(
      result.map(this._getOutputSuperAdminBlogDto),
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
  protected _getOutputSuperAdminBlogDto(
    blog: BlogsSqlType & { login: string }
  ): OutputSuperAdminBlogDto {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.userId.toString(),
        userLogin: blog.login
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate ? blog.banDate.toISOString() : null
      }
    };
  }
}
