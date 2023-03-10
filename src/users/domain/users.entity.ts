import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from '../../sessions/domain/session.entity';
import { Blog } from '../../blogs/domain/blogs.entity';
import { Comment } from '../../comments/domain/comments.entity';
import { UserBlogBan } from '../../users-blogs-ban/domain/users.blogs.ban.entity';
import { CommentLike } from '../../comment-likes/domain/comment.likes.entity';
import { PostLike } from '../../post-likes/domain/post.likes.entity';

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
  passwordRecoveryCode: string | null;

  @Column('timestamptz', { nullable: true })
  passwordRecoveryExpirationDate: Date | null;

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
  banDate: Date | null;

  @Column('varchar', { nullable: true, length: 500 })
  banReason: string | null;

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
