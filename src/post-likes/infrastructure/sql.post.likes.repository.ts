import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlPostLikesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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
}
