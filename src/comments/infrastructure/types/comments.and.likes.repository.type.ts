import { CommentDocument } from '../../domain/entities/comment.entity';
import { CommentLikeDocument } from '../../../comment-likes/domain/entities/comment.like.entity';

export type CommentsAndLikesRepositoryType = {
  commentDocument: CommentDocument;
  commentLikeDocument: CommentLikeDocument;
};
