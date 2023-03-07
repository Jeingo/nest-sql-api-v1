import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Post } from './posts.sql.type';
import { User } from './users.sql.type';
import { CommentLike } from './comment.likes.sql.type';

export type CommentsSqlType = {
  id: number;
  content: string;
  createdAt: Date;
  postId: number;
  userId: number;
};

@Entity('Comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column('timestamptz')
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  commentLikes: CommentLike[];
}
