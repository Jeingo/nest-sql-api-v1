import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbId } from '../../global-types/global.types';
import {
  CommentDocument,
  ICommentModel,
  Comment
} from '../domain/entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel
  ) {}
  create(
    content: string,
    userId: string,
    userLogin: string,
    postId: string,
    bloggerId: string
  ): CommentDocument {
    return this.commentsModel.make(
      content,
      userId,
      userLogin,
      postId,
      bloggerId
    );
  }
  async getById(id: DbId): Promise<CommentDocument> {
    return this.commentsModel.findById(id);
  }
  async getByUserId(userId: string): Promise<CommentDocument[]> {
    return this.commentsModel.find({ 'commentatorInfo.userId': userId });
  }
  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }
  async delete(id: DbId): Promise<CommentDocument> {
    return this.commentsModel.findByIdAndDelete(id);
  }
}
