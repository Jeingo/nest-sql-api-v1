import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../global-types/global.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentLike } from '../domain/comment.likes.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikesRepository: Repository<CommentLike>
  ) {}

  create(
    commentId: string,
    userId: string,
    newLikeStatus: LikeStatus
  ): CommentLike {
    return CommentLike.make(commentId, userId, newLikeStatus);
  }
  async get(commentId: string, userId: string): Promise<CommentLike> {
    return this.commentLikesRepository.findOneBy({
      commentId: +commentId,
      userId: +userId
    });
  }
  async save(commentLike: CommentLike): Promise<CommentLike> {
    return await this.commentLikesRepository.save(commentLike);
  }
}
