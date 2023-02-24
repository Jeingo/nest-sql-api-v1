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
  DbId,
  Direction,
  PaginatedType
} from '../../global-types/global.types';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) protected blogsModel: IBlogModel) {}

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
  async getById(id: DbId): Promise<OutputBlogDto> {
    const result = await this.blogsModel.findById(id);
    if (!result) throw new NotFoundException();
    if (result.blogOwnerInfo.isBanned || result.isBanned)
      throw new NotFoundException();
    return this._getOutputBlogDto(result);
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
}
