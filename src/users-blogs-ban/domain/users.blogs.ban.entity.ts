import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/users.entity';
import { Blog } from '../../blogs/domain/blogs.entity';

export type UsersBlogsBanEntity = {
  banDate: Date;
  banReason: string;
  blogId: number;
  userId: number;
};

@Entity('Users_Blogs_Ban')
export class UserBlogBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 500 })
  banReason: string;

  @Column('timestamptz')
  banDate: Date;

  @ManyToOne(() => Blog, (blog) => blog.userBlogBans)
  blog: Blog;

  @ManyToOne(() => User, (user) => user.userBlogBans)
  user: User;
}
