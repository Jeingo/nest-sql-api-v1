import { Injectable } from '@nestjs/common';
import { SqlDbId } from '../../global-types/global.types';
import { Comment } from '../domain/comments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>
  ) {}

  create(content: string, userId: string, postId: string): Comment {
    return Comment.make(content, userId, postId);
  }
  async save(comment: Comment): Promise<Comment> {
    return await this.commentsRepository.save(comment);
  }
  async getById(id: SqlDbId): Promise<Comment> {
    return this.commentsRepository.findOneBy({ id: +id });
  }
  async delete(id: SqlDbId): Promise<boolean> {
    await this.commentsRepository.delete(+id);
    return true;
  }
}
