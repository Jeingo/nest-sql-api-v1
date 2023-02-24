import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, ICommentModel } from '../domain/entities/comment.entity';
import {
  CommentLike,
  ICommentLikeModel
} from '../../comment-likes/domain/entities/comment.like.entity';
import {
  CurrentUserType,
  DbId,
  LikeStatus
} from '../../global-types/global.types';
import { CommentsAndLikesRepositoryType } from './types/comments.and.likes.repository.type';

@Injectable()
export class CommentsAndLikesRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel
  ) {}

  async get(
    commentId: DbId,
    userId: string
  ): Promise<CommentsAndLikesRepositoryType> {
    const comment = await this.commentsModel.findById(commentId);
    if (!comment) throw new NotFoundException();
    const commentLike = await this.commentLikesModel.findOne({
      userId: userId,
      commentId: commentId.toString()
    });
    return {
      commentDocument: comment,
      commentLikeDocument: commentLike
    };
  }
  async save(
    commentAndLike: CommentsAndLikesRepositoryType,
    user: CurrentUserType,
    newStatus: LikeStatus
  ): Promise<CommentsAndLikesRepositoryType> {
    await commentAndLike.commentDocument.save();
    if (!commentAndLike.commentLikeDocument) {
      commentAndLike.commentLikeDocument = this.commentLikesModel.make(
        user.userId,
        commentAndLike.commentDocument._id.toString(),
        newStatus
      );
    }
    await commentAndLike.commentLikeDocument.save();
    return commentAndLike;
  }
}
