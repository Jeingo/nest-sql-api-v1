import { Injectable } from '@nestjs/common';
import { SqlDbId } from '../../global-types/global.types';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../domain/blogs.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>
  ) {}

  create(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string
  ): Blog {
    return Blog.make(name, description, websiteUrl, userId);
  }
  async save(blog: Blog): Promise<Blog> {
    return await this.blogsRepository.save(blog);
  }
  async getById(id: SqlDbId): Promise<Blog> {
    return this.blogsRepository.findOneBy({ id: +id });
  }
  async delete(id: SqlDbId): Promise<boolean> {
    await this.blogsRepository.delete(+id);
    return true;
  }
  async bindWithUser(blogId: string, userId: string): Promise<boolean> {
    const queryString = `UPDATE "Blogs"
                         SET "userId"='${userId}'
                         WHERE "id"=${blogId}`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
}
