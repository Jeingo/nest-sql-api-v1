import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Session } from '../../sessions/domain/session.entity';
import { Blog } from '../../blogs/domain/blogs.entity';
import { Comment } from '../../comments/domain/comments.entity';
import { UserBlogBan } from '../../users-blogs-ban/domain/users.blogs.ban.entity';
import { CommentLike } from '../../comment-likes/domain/comment.likes.entity';
import { PostLike } from '../../post-likes/domain/post.likes.entity';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import * as bcrypt from 'bcrypt';

@Entity('Users')
export class User extends BaseEntity {
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

  updateEmailConfirmationStatus(): boolean {
    this.emailIsConfirmed = true;
    return true;
  }
  updateConfirmationCode(): boolean {
    this.emailConfirmationCode = v4();
    return true;
  }
  updatePasswordRecoveryConfirmationCode(): boolean {
    this.passwordRecoveryCode = v4();
    this.passwordRecoveryIsConfirmed = false;
    this.passwordRecoveryExpirationDate = add(new Date(), {
      hours: 1
    });
    return true;
  }
  updatePassword(newPassword: string): boolean {
    const passwordSalt = bcrypt.genSaltSync(10);
    this.hash = bcrypt.hashSync(newPassword, passwordSalt);
    this.passwordRecoveryIsConfirmed = true;
    return true;
  }
  ban(isBanned: boolean, banReason: string): boolean {
    if (isBanned) {
      this.isBanned = true;
      this.banDate = new Date();
      this.banReason = banReason;
    } else {
      this.isBanned = false;
      this.banDate = null;
      this.banReason = null;
    }
    return true;
  }
  static make(
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ): User {
    const passwordSalt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, passwordSalt);
    const newDate = new Date();
    const user = new User();
    user.login = login;
    user.hash = passwordHash;
    user.email = email;
    user.createdAt = newDate;
    user.passwordRecoveryCode = null;
    user.passwordRecoveryExpirationDate = null;
    user.passwordRecoveryIsConfirmed = true;
    user.emailConfirmationCode = v4();
    user.emailExpirationDate = add(newDate, { hours: 1 });
    user.emailIsConfirmed = isConfirmed;
    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;
    return user;
  }
}
