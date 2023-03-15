import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from '../../users/domain/users.entity';
import { Post } from '../../posts/domain/posts.entity';
import { UserBlogBan } from '../../users-blogs-ban/domain/users.blogs.ban.entity';

@Entity('Blogs')
export class Blog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 500 })
  description: string;

  @Column('varchar', { length: 100 })
  websiteUrl: string;

  @Column('timestamptz')
  createdAt: Date;

  @Column('boolean')
  isMembership: boolean;

  @Column('boolean')
  isBanned: boolean;

  @Column('timestamptz', { nullable: true })
  banDate: Date | null;

  @Column('integer')
  userId: number;

  @ManyToOne(() => User, (user) => user.blogs)
  user: User;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  @OneToMany(() => UserBlogBan, (userBlogBan) => userBlogBan.blog)
  userBlogBans: UserBlogBan[];

  update(name: string, description: string, websiteUrl: string): boolean {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
    return true;
  }

  isOwner(userId): boolean {
    return this.userId.toString() === userId;
  }

  ban(isBanned: boolean): boolean {
    if (isBanned) {
      this.banDate = new Date();
      this.isBanned = true;
    } else {
      this.banDate = null;
      this.isBanned = false;
    }
    return true;
  }

  bindWithUser(userId: string): boolean {
    this.userId = +userId;
    return true;
  }

  static make(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string
  ): Blog {
    const blog = new Blog();
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    blog.isBanned = false;
    blog.banDate = null;
    blog.userId = +userId;
    return blog;
  }
}
