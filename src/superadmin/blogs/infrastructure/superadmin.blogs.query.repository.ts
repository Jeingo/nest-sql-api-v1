import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  IBlogModel
} from '../../../blogs/domain/entities/blog.entity';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import { OutputSuperAdminBlogDto } from '../api/dto/output.superadmin.blog.dto';
import { Direction, PaginatedType } from '../../../global-types/global.types';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../../../helper/query/query.repository.helper';

@Injectable()
export class SuperAdminBlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}

  async getAll(
    query: QueryBlogs
  ): Promise<PaginatedType<OutputSuperAdminBlogDto>> {
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
    const countAllDocuments = await this.blogsModel.countDocuments(filter);
    const result = await this.blogsModel
      .find(filter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);

    return getPaginatedType(
      result.map(this._getOutputSuperAdminBlogDto),
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  protected _getOutputSuperAdminBlogDto(
    blog: BlogDocument
  ): OutputSuperAdminBlogDto {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.blogOwnerInfo.userId,
        userLogin: blog.blogOwnerInfo.userLogin
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate
      }
    };
  }
}
