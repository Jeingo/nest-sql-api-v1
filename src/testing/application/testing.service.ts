import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async removeAll() {
    await this.dataSource.query(`TRUNCATE "Users" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Session" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Blogs" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Posts" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Users_Blogs_Ban" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Comments" CASCADE`);
    await this.dataSource.query(`TRUNCATE "CommentLikes" CASCADE`);
    await this.dataSource.query(`TRUNCATE "PostLikes" CASCADE`);
  }
}
