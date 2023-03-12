import { Injectable } from '@nestjs/common';
import { SqlDbId } from '../../global-types/global.types';
import { Post } from '../domain/posts.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<Post> {
    const result = await this.dataSource.query(
      `INSERT INTO "Posts" 
             (title, "shortDescription", content, "createdAt","blogId") 
             VALUES
             ('${title}', '${shortDescription}','${content}', now(), ${blogId}) RETURNING *;`
    );
    return result[0];
  }
  async getById(id: SqlDbId): Promise<Post> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE id=$1;`,
      [id]
    );
    return result[0];
  }
  async update(
    postId: SqlDbId,
    title: string,
    shortDescription: string,
    content: string
  ): Promise<boolean> {
    const queryString = `UPDATE "Posts"
                         SET title='${title}',
                         "shortDescription"='${shortDescription}',
                         content='${content}'
                         WHERE "id"=${postId}`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
  async delete(id: SqlDbId): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Posts" WHERE id=${id}`
    );
    return !!result[1];
  }
}