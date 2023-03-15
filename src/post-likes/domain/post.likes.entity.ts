import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { LikeStatus } from '../../global-types/global.types';
import { User } from '../../users/domain/users.entity';
import { Post } from '../../posts/domain/posts.entity';

@Entity('PostLikes')
export class PostLike extends BaseEntity {
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

  update(newLikeStatus: LikeStatus): boolean {
    this.myStatus = newLikeStatus;
    return true;
  }

  static make(
    postId: string,
    userId: string,
    newLikeStatus: LikeStatus
  ): PostLike {
    const postLike = new PostLike();
    postLike.postId = +postId;
    postLike.userId = +userId;
    postLike.myStatus = newLikeStatus;
    postLike.addedAt = new Date();
    return postLike;
  }
}
