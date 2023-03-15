import { Injectable, NotFoundException } from '@nestjs/common';
import { OutputBlogDto } from '../api/dto/output.blog.dto';
import { QueryBlogs } from '../api/types/query.blogs.type';
import { getPaginatedType } from '../../helper/query/query.repository.helper';
import {
  Direction,
  PaginatedType,
  SqlDbId
} from '../../global-types/global.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../domain/blogs.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    protected blogsRepository: Repository<Blog>
  ) {}

  async getAll(query: QueryBlogs): Promise<PaginatedType<OutputBlogDto>> {
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
      .createQueryBuilder('b')
      .leftJoin('b.user', 'u')
      .where('b."isBanned"=false')
      .andWhere('u."isBanned"=false')
      .andWhere(`name ILIKE :searchNameTerm`, {
        searchNameTerm: `%${searchNameTerm}%`
      })
      .orderBy(`b."${sortBy}"`, direction)
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
  async getById(id: SqlDbId): Promise<OutputBlogDto> {
    const blog = await this.blogsRepository
      .createQueryBuilder('b')
      .leftJoin('b.user', 'u')
      .where('b.id=:blogId', { blogId: +id })
      .andWhere('b."isBanned"=false')
      .andWhere('u."isBanned"=false')
      .getOne();

    if (!blog) throw new NotFoundException();
    return this.sqlGetOutputBlogDto(blog);
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
