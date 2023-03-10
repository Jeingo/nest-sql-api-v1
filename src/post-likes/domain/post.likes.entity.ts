import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikeStatus } from '../../global-types/global.types';
import { User } from '../../users/domain/users.entity';
import { Post } from '../../posts/domain/posts.entity';

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

  @Column('integer')
  postId: number;

  @Column('integer')
  userId: number;

  @ManyToOne(() => Post, (post) => post.postLikes)
  post: Post;

  @ManyToOne(() => User, (user) => user.postLikes)
  user: User;
}
