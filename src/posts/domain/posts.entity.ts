import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Blog } from '../../blogs/domain/blogs.entity';
import { Comment } from '../../comments/domain/comments.entity';
import { PostLike } from '../../post-likes/domain/post.likes.entity';

export type PostsSqlType = {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: Date;
  blogId: number;
};

@Entity('Posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  title: string;

  @Column('varchar', { length: 500 })
  shortDescription: string;

  @Column('text')
  content: string;

  @Column('timestamptz')
  createdAt: Date;

  @Column('integer')
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  postLikes: PostLike[];
}
