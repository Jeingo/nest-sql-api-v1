import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './users.sql.type';
import { Post } from './posts.sql.type';
import { UserBlogBan } from './users.blogs.ban.sql.type';

export type BlogsSqlType = {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  isBanned: boolean;
  banDate: Date | null;
  userId: number;
};

@Entity('Blogs')
export class Blog {
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
  banDate: Date;

  @ManyToOne(() => User, (user) => user.blogs)
  user: User;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  @OneToMany(() => UserBlogBan, (userBlogBan) => userBlogBan.blog)
  userBlogBans: UserBlogBan[];
}
