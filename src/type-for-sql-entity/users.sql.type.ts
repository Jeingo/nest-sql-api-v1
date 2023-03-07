import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from './session.sql.type';
import { Blog } from './blogs.sql.type';
import { Comment } from './comments.sql.type';
import { UserBlogBan } from './users.blogs.ban.sql.type';
import { CommentLike } from './comment.likes.sql.type';
import { PostLike } from './post.likes.sql.type';

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
