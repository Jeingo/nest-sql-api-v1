import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Post } from '../../posts/domain/posts.entity';
import { User } from '../../users/domain/users.entity';
import { CommentLike } from '../../comment-likes/domain/comment.likes.entity';

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
