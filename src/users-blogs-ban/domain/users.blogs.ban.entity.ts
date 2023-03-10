import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/users.entity';
import { Blog } from '../../blogs/domain/blogs.entity';

@Entity('Users_Blogs_Ban')
export class UserBlogBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 500 })
  banReason: string;

  @Column('timestamptz')
  banDate: Date;

  @Column('integer')
  blogId: number;

  @Column('integer')
  userId: number;

  @ManyToOne(() => Blog, (blog) => blog.userBlogBans)
  blog: Blog;

  @ManyToOne(() => User, (user) => user.userBlogBans)
  user: User;
}
