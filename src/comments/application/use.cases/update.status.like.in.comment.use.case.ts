import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  DbId,
  LikeStatus
} from '../../../global-types/global.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLikesRepository } from '../../../comment-likes/infrastructure/comment.likes.repository';
import { CommentsAndLikesRepository } from '../../infrastructure/comments.and.likes.repository';

export class UpdateLikeStatusInCommentCommand {
  constructor(
    public user: CurrentUserType,
    public commentId: DbId,
    public newLikeStatus: LikeStatus
  ) {}
}

@CommandHandler(UpdateLikeStatusInCommentCommand)
export class UpdateLikeStatusInCommentUseCase {
  constructor(
    private readonly commentRepository: CommentsRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentsAndLikesRepository: CommentsAndLikesRepository
  ) {}

  async execute(command: UpdateLikeStatusInCommentCommand): Promise<boolean> {
    const user = command.user;
    const commentId = command.commentId;
    const newLikeStatus = command.newLikeStatus;
    //todo to ask
    const commentForLikeUpdate = await this.commentsAndLikesRepository.get(
      commentId,
      user.userId
    );

    commentForLikeUpdate.commentDocument.updateLikeNew(
      user,
      newLikeStatus,
      commentForLikeUpdate.commentLikeDocument
    );

    await this.commentsAndLikesRepository.save(
      commentForLikeUpdate,
      user,
      newLikeStatus
    );

    return true;
  }
}
