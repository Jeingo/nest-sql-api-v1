import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IPostLikeModel,
  PostLike,
  PostLikeDocument
} from '../domain/entities/post.like.entity';
import { DbId, LikeStatus } from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlPostLikesRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async updateLike(
    postId: string,
    userId: string,
    newLikeStatus: LikeStatus
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM "PostLikes"
             WHERE "userId"=${userId}
             AND "postId"=${postId}`
    );
    if (result.length !== 0) {
      await this.dataSource.query(`UPDATE "PostLikes"
                         SET "myStatus"='${newLikeStatus}'
                         WHERE "userId"=${userId}
                         AND "postId"=${postId}`);
    } else {
      await this.dataSource.query(
        `INSERT INTO "PostLikes" 
             ("myStatus", "postId", "userId", "addedAt") 
             VALUES
             ('${newLikeStatus}', ${postId}, ${userId}, now());`
      );
    }
    return true;
  }
  create(
    userId: string,
    postId: string,
    myStatus: LikeStatus,
    login: string
  ): PostLikeDocument {
    return this.postLikesModel.make(userId, postId, myStatus, login);
  }
  async getById(id: DbId): Promise<PostLikeDocument> {
    return this.postLikesModel.findById(id);
  }
  async getByUserId(userId: string): Promise<PostLikeDocument[]> {
    return this.postLikesModel.find({ userId: userId });
  }
  async getByUserIdAndPostId(
    userId: string,
    postId: string
  ): Promise<PostLikeDocument> {
    return this.postLikesModel.findOne({
      userId: userId,
      postId: postId
    });
  }
  async save(postLike: PostLikeDocument): Promise<PostLikeDocument> {
    return await postLike.save();
  }
}
