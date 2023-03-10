import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentLikesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
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
}
