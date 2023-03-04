import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  LikeStatus,
  SqlDbId
} from '../../../global-types/global.types';
import { SqlCommentsRepository } from '../../infrastructure/sql.comments.repository';
import { NotFoundException } from '@nestjs/common';
import { SqlCommentLikesRepository } from '../../../comment-likes/infrastructure/sql.comment.likes.repository';

export class UpdateLikeStatusInCommentCommand {
  constructor(
    public user: CurrentUserType,
    public commentId: SqlDbId,
    public newLikeStatus: LikeStatus
  ) {}
}

@CommandHandler(UpdateLikeStatusInCommentCommand)
export class UpdateLikeStatusInCommentUseCase {
  constructor(
    private readonly sqlCommentRepository: SqlCommentsRepository,
    private readonly sqlCommentLikesRepository: SqlCommentLikesRepository
  ) {}

  async execute(command: UpdateLikeStatusInCommentCommand): Promise<boolean> {
    const user = command.user;
    const commentId = command.commentId;
    const newLikeStatus = command.newLikeStatus;

    const comment = await this.sqlCommentRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    await this.sqlCommentLikesRepository.updateLike(
      commentId,
      user.userId,
      newLikeStatus
    );
    return true;
  }
}
