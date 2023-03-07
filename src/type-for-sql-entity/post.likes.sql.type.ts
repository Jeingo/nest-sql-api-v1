import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikeStatus } from '../global-types/global.types';
import { User } from './users.sql.type';
import { Post } from './posts.sql.type';

export type PostLikesSqlType = {
  id: number;
  myStatus: string;
  addedAt: Date;
  postId: number;
  userId: number;
};

@Entity('PostLikes')
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('enum', { enum: LikeStatus })
  myStatus: LikeStatus;

  @Column('timestamptz')
  addedAt: Date;

  @ManyToOne(() => Post, (post) => post.postLikes)
  post: Post;

  @ManyToOne(() => User, (user) => user.postLikes)
  user: User;
}
