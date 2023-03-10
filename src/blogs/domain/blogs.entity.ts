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
}
