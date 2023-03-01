import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from '../domain/entities/blog.entity';
import { OutputBlogDto } from '../api/dto/output.blog.dto';
import { QueryBlogs } from '../api/types/query.blogs.type';
import {
  bannedFilter,
  getPaginatedType,
  makeDirectionToNumber
} from '../../helper/query/query.repository.helper';
import {
  Direction,
  PaginatedType,
  SqlDbId
} from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsSqlType } from '../../type-for-sql-entity/blogs.sql.type';

@Injectable()
export class SqlBlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) protected blogsModel: IBlogModel,
    @InjectDataSource() protected readonly dataSource: DataSource
  ) {}

  async getAll(query: QueryBlogs): Promise<PaginatedType<OutputBlogDto>> {
    const {
      searchNameTerm = null,
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;
    let filter = {};
    if (searchNameTerm) {
      filter = { name: { $regex: new RegExp(searchNameTerm, 'gi') } };
    }
    const finalFilter = {
      ...filter,
      ...bannedFilter('blogOwnerInfo.isBanned'),
      ...bannedFilter('isBanned')
    };
    const countAllDocuments = await this.blogsModel.countDocuments(finalFilter);
    const result = await this.blogsModel
      .find(finalFilter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);

    return getPaginatedType(
      result.map(this._getOutputBlogDto),
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: SqlDbId): Promise<OutputBlogDto> {
    const result = await this.dataSource.query(
      `SELECT b.*, u."isBanned" AS "ownerIsBanned" FROM "Blogs" b LEFT JOIN "Users" u ON b."userId"=u.id WHERE b.id=${id}`
    );
    if (!result[0]) throw new NotFoundException();
    if (result[0].isBanned || result[0].ownerIsBanned)
      throw new NotFoundException();
    return this.sqlGetOutputBlogDto(result[0]);
  }
  protected _getOutputBlogDto(blog: BlogDocument): OutputBlogDto {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership
    };
  }
  protected sqlGetOutputBlogDto(blog: BlogsSqlType): OutputBlogDto {
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
