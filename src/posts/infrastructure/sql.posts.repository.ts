import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from '../domain/entities/post.entity';
import { SqlDbId } from '../../global-types/global.types';
import { PostsSqlType } from '../../type-for-sql-entity/posts.sql.type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlPostsRepository {
  constructor(
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<PostsSqlType> {
    const result = await this.dataSource.query(
      `INSERT INTO "Posts" 
             (title, "shortDescription", content, "createdAt","blogId") 
             VALUES
             ('${title}', '${shortDescription}','${content}', now(), ${blogId}) RETURNING *;`
    );
    return result[0];
  }
  async getById(id: SqlDbId): Promise<PostsSqlType> {
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
  async getByUserId(userId: string): Promise<PostDocument[]> {
    return this.postsModel.find({ 'postOwnerInfo.userId': userId });
  }
  async getByBlogId(blogId: string): Promise<PostDocument[]> {
    return this.postsModel.find({ blogId: blogId });
  }
  async save(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }
  async delete(id: SqlDbId): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Posts" WHERE id=${id}`
    );
    return !!result[1];
  }
}