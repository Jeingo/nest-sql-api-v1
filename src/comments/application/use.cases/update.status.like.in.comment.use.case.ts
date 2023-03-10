import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  LikeStatus,
  SqlDbId
} from '../../../global-types/global.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentLikesRepository } from '../../../comment-likes/infrastructure/comment.likes.repository';
import { BlogsUsersBanRepository } from '../../../blogger/users/infrastructure/blogs.users.ban.repository';

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
    private readonly commentsRepository: CommentsRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}
  //todo refactoring
  async execute(command: UpdateLikeStatusInCommentCommand): Promise<boolean> {
    const user = command.user;
    const commentId = command.commentId;
    const newLikeStatus = command.newLikeStatus;

    const comment = await this.commentsRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    const userIsBannedForBlog =
      await this.blogsUsersBanRepository.isBannedUserByPostId(
        comment.postId.toString(),
        user.userId
      );
    if (userIsBannedForBlog) throw new ForbiddenException();

    await this.commentLikesRepository.updateLike(
      commentId,
      user.userId,
      newLikeStatus
    );
    return true;
  }
}
