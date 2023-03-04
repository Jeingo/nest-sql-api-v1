import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbId, LikeStatus } from '../../global-types/global.types';
import {
  CommentLike,
  CommentLikeDocument,
  ICommentLikeModel
} from '../domain/entities/comment.like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlCommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async updateLike(
    commentId: string,
    userId: string,
    newLikeStatus: LikeStatus
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM "CommentLikes"
             WHERE "userId"=${userId}
             AND "commentId"=${commentId}`
    );
    if (result.length !== 0) {
      await this.dataSource.query(`UPDATE "CommentLikes"
                         SET "myStatus"='${newLikeStatus}'
                         WHERE "userId"=${userId}
                         AND "commentId"=${commentId}`);
    } else {
      await this.dataSource.query(
        `INSERT INTO "CommentLikes" 
             ("myStatus", "commentId", "userId") 
             VALUES
             ('${newLikeStatus}', ${commentId}, ${userId});`
      );
    }
    return true;
  }

  create(
    userId: string,
    commentId: string,
    myStatus: LikeStatus
  ): CommentLikeDocument {
    return this.commentLikesModel.make(userId, commentId, myStatus);
  }
  async getById(id: DbId): Promise<CommentLikeDocument> {
    return this.commentLikesModel.findById(id);
  }
  async getByUserId(userId: string): Promise<CommentLikeDocument[]> {
    return this.commentLikesModel.find({ userId: userId });
  }
  async getByUserIdAndCommentId(
    userId: string,
    commentId: string
  ): Promise<CommentLikeDocument> {
    return this.commentLikesModel.findOne({
      userId: userId,
      commentId: commentId
    });
  }
  async save(commentLike: CommentLikeDocument): Promise<CommentLikeDocument> {
    return await commentLike.save();
  }
}
