import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBlogBan } from '../domain/users.blogs.ban.entity';

@Injectable()
export class BlogsUsersBanRepository {
  constructor(
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
  async getByBlogId(
    blogId: string,
    bannedUserId: string
  ): Promise<UserBlogBan> {
    return this.blogsUsersBanRepository.findOneBy({
      blogId: +blogId,
      userId: +bannedUserId
    });
  }
  async getByPostId(
    postId: string,
    bannedUserId: string
  ): Promise<UserBlogBan> {
    return await this.blogsUsersBanRepository
      .createQueryBuilder('ubb')
      .leftJoin('Blogs', 'b', 'b.id=ubb."blogId"')
      .leftJoin('Posts', 'p', 'p."blogId"=b.id')
      .where('p.id=:postId', { postId: +postId })
      .andWhere('ubb."userId"=:userId', { userId: +bannedUserId })
      .getOne();
  }
  async save(userBlogBan: UserBlogBan): Promise<UserBlogBan> {
    return await this.blogsUsersBanRepository.save(userBlogBan);
  }
}
