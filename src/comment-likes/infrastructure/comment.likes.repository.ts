import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbId, LikeStatus } from '../../global-types/global.types';
import {
  CommentLike,
  CommentLikeDocument,
  ICommentLikeModel
} from '../domain/entities/comment.like.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel
  ) {}
  create(
    userId: string,
    commentId: string,
    myStatus: LikeStatus
  ): CommentLikeDocument {
    return this.commentLikesModel.make(userId, commentId, myStatus);
  }
  async getById(id: DbId): Promise<CommentLikeDocument> {
    return this.commentLikesModel.findById(id);
  }
  async getByUserId(userId: string): Promise<CommentLikeDocument[]> {
    return this.commentLikesModel.find({ userId: userId });
  }
  async getByUserIdAndCommentId(
    userId: string,
    commentId: string
  ): Promise<CommentLikeDocument> {
    return this.commentLikesModel.findOne({
      userId: userId,
      commentId: commentId
    });
  }
  async save(commentLike: CommentLikeDocument): Promise<CommentLikeDocument> {
    return await commentLike.save();
  }
}
