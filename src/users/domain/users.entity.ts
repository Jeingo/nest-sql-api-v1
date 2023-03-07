import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from '../../sessions/domain/session.entity';
import { Blog } from '../../blogs/domain/blogs.entity';
import { Comment } from '../../comments/domain/comments.entity';
import { UserBlogBan } from '../../users-blogs-ban/domain/users.blogs.ban.entity';
import { CommentLike } from '../../comment-likes/domain/comment.likes.entity';
import { PostLike } from '../../post-likes/domain/post.likes.entity';

export type UsersSqlType = {
  id: number;
  login: string;
  hash: string;
  email: string;
  createdAt: Date;
  passwordRecoveryCode: string | null;
  passwordRecoveryExpirationDate: Date | null;
  passwordRecoveryIsConfirmed: boolean;
  emailConfirmationCode: string;
  emailExpirationDate: Date;
  emailIsConfirmed: boolean;
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
};

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  login: string;

  @Column('varchar', { length: 100 })
  hash: string;

  @Column('varchar', { length: 100 })
  email: string;

  @Column('timestamptz')
  createdAt: Date;

  @Column('uuid', { nullable: true })
  passwordRecoveryCode: string;

  @Column('timestamptz', { nullable: true })
  passwordRecoveryExpirationDate: Date;

  @Column('boolean')
  passwordRecoveryIsConfirmed: boolean;

  @Column('uuid')
  emailConfirmationCode: string;

  @Column('timestamptz')
  emailExpirationDate: Date;

  @Column('boolean')
  emailIsConfirmed: boolean;

  @Column('boolean')
  isBanned: boolean;

  @Column('timestamptz', { nullable: true })
  banDate: Date;

  @Column('varchar', { nullable: true, length: 500 })
  banReason: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => UserBlogBan, (userBlogBan) => userBlogBan.user)
  userBlogBans: UserBlogBan[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentLikes: CommentLike[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike[];
}
