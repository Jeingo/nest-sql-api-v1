import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Blog } from '../../blogs/domain/blogs.entity';
import { Comment } from '../../comments/domain/comments.entity';
import { PostLike } from '../../post-likes/domain/post.likes.entity';

@Entity('Posts')
export class Post extends BaseEntity {
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

  update(title: string, shortDescription: string, content: string): boolean {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    return true;
  }
  isOwnersBlog(blogId): boolean {
    return this.blogId.toString() === blogId;
  }
  static make(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Post {
    const post = new Post();
    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.createdAt = new Date();
    post.blogId = +blogId;
    return post;
  }
}
