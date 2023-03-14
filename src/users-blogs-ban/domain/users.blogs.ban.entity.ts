import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from '../../users/domain/users.entity';
import { Blog } from '../../blogs/domain/blogs.entity';

@Entity('Users_Blogs_Ban')
export class UserBlogBan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('boolean')
  isBanned: boolean;

  @Column('varchar', { length: 500, nullable: true })
  banReason: string | null;

  @Column('timestamptz', { nullable: true })
  banDate: Date | null;

  @Column('integer')
  blogId: number;

  @Column('integer')
  userId: number;

  @ManyToOne(() => Blog, (blog) => blog.userBlogBans)
  blog: Blog;

  @ManyToOne(() => User, (user) => user.userBlogBans)
  user: User;

  update(isBanned: boolean, banReason: string): boolean {
    if (this.isBanned === true && isBanned === true) {
      this.banDate = new Date();
      this.banReason = banReason;
    }
    if (this.isBanned === true && isBanned === false) {
      this.isBanned = false;
      this.banDate = null;
      this.banReason = null;
    }
    if (this.isBanned === false && isBanned === true) {
      this.isBanned = true;
      this.banDate = new Date();
      this.banReason = banReason;
    }
    return true;
  }

  static make(
    bannedUserId: string,
    blogId: string,
    isBanned: boolean,
    banReason: string
  ): UserBlogBan {
    const userBlogBan = new UserBlogBan();
    if (isBanned) {
      userBlogBan.userId = +bannedUserId;
      userBlogBan.blogId = +blogId;
      userBlogBan.isBanned = isBanned;
      userBlogBan.banDate = new Date();
      userBlogBan.banReason = banReason;
      return userBlogBan;
    }
  }
}
