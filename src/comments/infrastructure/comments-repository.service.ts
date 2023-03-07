import { Injectable } from '@nestjs/common';
import { SqlDbId } from '../../global-types/global.types';
import { CommentsSqlType } from '../domain/comments.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async create(
    content: string,
    userId: string,
    postId: string
  ): Promise<CommentsSqlType> {
    const result = await this.dataSource.query(
      `INSERT INTO "Comments" 
             (content, "createdAt", "postId", "userId") 
             VALUES
             ('${content}', now(),${postId},${userId}) RETURNING *;`
    );
    return result[0];
  }
  async getById(id: SqlDbId): Promise<CommentsSqlType> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Comments" WHERE id=$1;`,
      [id]
    );
    return result[0];
  }
  async update(id: SqlDbId, content: string): Promise<boolean> {
    const queryString = `UPDATE "Comments"
                         SET content='${content}'
                         WHERE "id"=${id}`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
  async delete(id: SqlDbId): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Comments" WHERE id=${id}`
    );
    return !!result[1];
  }
}
