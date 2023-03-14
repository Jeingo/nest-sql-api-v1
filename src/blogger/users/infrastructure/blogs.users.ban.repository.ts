import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserBlogBan } from '../../../users-blogs-ban/domain/users.blogs.ban.entity';

@Injectable()
export class BlogsUsersBanRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(UserBlogBan)
    private blogsUsersBanRepository: Repository<UserBlogBan>
  ) {}

  create(
    bannedUserId: string,
    blogId: string,
    isBanned: boolean,
    banReason: string
  ): UserBlogBan {
    return UserBlogBan.make(bannedUserId, blogId, isBanned, banReason);
  }
  async get(blogId: string, bannedUserId: string): Promise<UserBlogBan> {
    return this.blogsUsersBanRepository.findOneBy({
      blogId: +blogId,
      userId: +bannedUserId
    });
  }
  async save(userBlogBan: UserBlogBan): Promise<UserBlogBan> {
    return await this.blogsUsersBanRepository.save(userBlogBan);
  }

  //todo move to entity
  async isBannedUser(blogId: string, userId: string): Promise<boolean> {
    const result = await this.blogsUsersBanRepository.findOneBy({
      blogId: +blogId,
      userId: +userId,
      isBanned: true
    });
    return !!result;
  }
  async isBannedUserByPostId(postId: string, userId: string): Promise<boolean> {
    const result = await this.blogsUsersBanRepository
      .createQueryBuilder('ubb')
      .leftJoin('Blogs', 'b', 'b.id=ubb."blogId"')
      .leftJoin('Posts', 'p', 'p."blogId"=b.id')
      .where('p.id=:postId', { postId: +postId })
      .andWhere('ubb."userId"=:userId', { userId: +userId })
      .andWhere('ubb."isBanned"=true')
      .getOne();
    return !!result;
  }
}
