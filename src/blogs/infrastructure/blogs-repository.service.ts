import { Injectable } from '@nestjs/common';
import { SqlDbId } from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsSqlType } from '../../type-for-sql-entity/blogs.sql.type';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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
  async getById(id: SqlDbId): Promise<BlogsSqlType> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE id=$1;`,
      [id]
    );
    return result[0];
  }
  async update(
    blogId: SqlDbId,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> {
    const queryString = `UPDATE "Blogs"
                         SET name='${name}',
                         description='${description}',
                         "websiteUrl"='${websiteUrl}'
                         WHERE "id"=${blogId}`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
  async bindWithUser(blogId: string, userId: string): Promise<boolean> {
    const queryString = `UPDATE "Blogs"
                         SET "userId"='${userId}'
                         WHERE "id"=${blogId}`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
  async banBlog(blogId: string, isBanned: boolean): Promise<boolean> {
    if (isBanned) {
      const result = await this.dataSource.query(
        `UPDATE "Blogs"
               SET "isBanned"=true,
               "banDate"=now()
               WHERE id=${blogId}`
      );
      return !!result[1];
    }
    const result = await this.dataSource.query(
      `UPDATE "Blogs"
               SET "isBanned"=false,
               "banDate"=NULL
               WHERE id=${blogId}`
    );
    return !!result[1];
  }
  async delete(id: SqlDbId): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Blogs" WHERE id=${id}`
    );
    return !!result[1];
  }
}
