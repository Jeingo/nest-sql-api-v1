import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { Injectable } from '@nestjs/common';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import {
  CurrentUserType,
  Direction,
  PaginatedType
} from '../../../global-types/global.types';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../../../helper/query/query.repository.helper';
import { OutputBlogDto } from '../../../blogs/api/dto/output.blog.dto';

@Injectable()
export class BloggerBlogsQueryRepository extends BlogsQueryRepository {
  async getAllForBlogger(
    query: QueryBlogs,
    user: CurrentUserType
  ): Promise<PaginatedType<OutputBlogDto>> {
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
      filter = {
        name: { $regex: new RegExp(searchNameTerm, 'gi') }
      };
    }
    const countAllDocuments = await this.blogsModel.countDocuments({
      'blogOwnerInfo.userId': user.userId,
      ...filter
    });
    const result = await this.blogsModel
      .find({ 'blogOwnerInfo.userId': user.userId, ...filter })
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
}
