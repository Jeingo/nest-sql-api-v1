import { Injectable } from '@nestjs/common';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import { OutputSuperAdminBlogDto } from '../api/dto/output.superadmin.blog.dto';
import { Direction, PaginatedType } from '../../../global-types/global.types';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../../blogs/domain/blogs.entity';
import { User } from '../../../users/domain/users.entity';

@Injectable()
export class SuperAdminBlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>
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
    const direction = sortDirection.toUpperCase() as Direction;

    const [blogs, count] = await this.blogsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .where(`b.name ILIKE :searchNameTerm`, {
        searchNameTerm: `%${searchNameTerm}%`
      })
      .orderBy(`b."${sortBy}"`, direction)
      .limit(+pageSize)
      .offset(skipNumber)
      .getManyAndCount();

    return getPaginatedType(
      blogs.map(this.getOutputSuperAdminBlogDto),
      +pageSize,
      +pageNumber,
      count
    );
  }
  protected getOutputSuperAdminBlogDto(
    blog: Blog & { user: User }
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
        userLogin: blog.user.login
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate ? blog.banDate.toISOString() : null
      }
    };
  }
}
