import { Injectable } from '@nestjs/common';
import { SqlDbId } from '../../global-types/global.types';
import { Post } from '../domain/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>
  ) {}

  create(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Post {
    return Post.make(title, shortDescription, content, blogId);
  }
  async save(post: Post): Promise<Post> {
    return await this.postsRepository.save(post);
  }
  async getById(id: SqlDbId): Promise<Post> {
    return this.postsRepository.findOneBy({ id: +id });
  }
  async delete(id: SqlDbId): Promise<boolean> {
    await this.postsRepository.delete(+id);
    return true;
  }
}
