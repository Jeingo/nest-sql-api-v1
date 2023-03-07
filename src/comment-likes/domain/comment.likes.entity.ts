import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/users.entity';
import { LikeStatus } from '../../global-types/global.types';
import { Comment } from '../../comments/domain/comments.entity';

export type CommentLikesSqlType = {
  id: number;
  myStatus: string;
  commentId: number;
  userId: number;
};

@Entity('CommentLikes')
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('enum', { enum: LikeStatus })
  myStatus: LikeStatus;

  @ManyToOne(() => Comment, (comment) => comment.commentLikes)
  comment: Comment;

  @ManyToOne(() => User, (user) => user.commentLikes)
  user: User;
}
