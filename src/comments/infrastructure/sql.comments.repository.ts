import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbId } from '../../global-types/global.types';
import {
  CommentDocument,
  ICommentModel,
  Comment
} from '../domain/entities/comment.entity';
import { CommentsSqlType } from '../../type-for-sql-entity/comments.sql.type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlCommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
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
  async getById(id: DbId): Promise<CommentDocument> {
    return this.commentsModel.findById(id);
  }
  async getByUserId(userId: string): Promise<CommentDocument[]> {
    return this.commentsModel.find({ 'commentatorInfo.userId': userId });
  }
  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }
  async delete(id: DbId): Promise<CommentDocument> {
    return this.commentsModel.findByIdAndDelete(id);
  }
}
