import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../global-types/global.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from '../domain/post.likes.entity';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>
  ) {}

  create(postId: string, userId: string, newLikeStatus: LikeStatus): PostLike {
    return PostLike.make(postId, userId, newLikeStatus);
  }
  async get(postId: string, userId: string): Promise<PostLike> {
    return this.postLikesRepository.findOneBy({
      postId: +postId,
      userId: +userId
    });
  }
  async save(postLike: PostLike): Promise<PostLike> {
    return await this.postLikesRepository.save(postLike);
  }
}
