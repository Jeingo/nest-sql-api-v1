import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from '../domain/entities/blog.entity';
import { DbId } from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsSqlType } from '../../type-for-sql-entity/blogs.sql.type';

@Injectable()
export class SqlBlogRepository {
  constructor(
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async create(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string
  ): Promise<BlogsSqlType> {
    const result = await this.dataSource.query(
      `INSERT INTO "Blogs" 
             (name, description, "websiteUrl", "createdAt","isMembership",
             "isBanned","banDate", "userId") 
             VALUES
             ('${name}', '${description}','${websiteUrl}', now(), false, false, NULL, ${userId}) RETURNING *;`
    );
    return result[0];
  }
  async getById(id: DbId): Promise<BlogDocument> {
    return this.blogsModel.findById(id);
  }
  async getByUserId(userId: string): Promise<BlogDocument[]> {
    return this.blogsModel.find({ 'blogOwnerInfo.userId': userId });
  }
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }
  async delete(id: DbId): Promise<BlogDocument> {
    return this.blogsModel.findByIdAndDelete(id);
  }
}
