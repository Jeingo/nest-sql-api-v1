import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqlDbId } from '../../../global-types/global.types';
import { UsersSqlType } from '../../../type-for-sql-entity/users.sql.type';

@Injectable()
export class BlogsUsersBanRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getById(id: SqlDbId): Promise<UsersSqlType> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1;`,
      [id]
    );
    return result[0];
  }
  async ban(
    bannedUserId: string,
    blogId: string,
    isBanned: boolean,
    banReason: string
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Users_Blogs_Ban" WHERE "blogId"=${blogId} AND "userId"=${bannedUserId};`
    );
    if (result.length !== 0 && isBanned) {
      await this.dataSource.query(`UPDATE "Users_Blogs_Ban"
                         SET "banDate"=now(),
                         "banReason"='${banReason}'
                         WHERE "blogId"=${blogId}
                         AND "userId"=${bannedUserId}`);
    }
    if (result.length !== 0 && !isBanned) {
      await this.dataSource.query(
        `DELETE FROM "Users_Blogs_Ban" 
               WHERE "blogId"=${blogId}
               AND "userId"=${bannedUserId}`
      );
    }
    if (result.length === 0 && isBanned) {
      await this.dataSource.query(
        `INSERT INTO "Users_Blogs_Ban" 
             ("banDate", "banReason", "blogId", "userId") 
             VALUES
             (now(), '${banReason}',${blogId}, ${bannedUserId});`
      );
    }
    return true;
  }
}
