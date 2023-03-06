import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  LikeStatus,
  SqlDbId
} from '../../../global-types/global.types';
import { CommentsRepository } from '../../infrastructure/comments-repository.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentLikesRepository } from '../../../comment-likes/infrastructure/comment-likes-repository.service';
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
    private readonly sqlCommentRepository: CommentsRepository,
    private readonly sqlCommentLikesRepository: CommentLikesRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}

  async execute(command: UpdateLikeStatusInCommentCommand): Promise<boolean> {
    const user = command.user;
    const commentId = command.commentId;
    const newLikeStatus = command.newLikeStatus;

    const comment = await this.sqlCommentRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    const userIsBannedForBlog =
      await this.blogsUsersBanRepository.isBannedUserByPostId(
        comment.postId.toString(),
        user.userId
      );
    if (userIsBannedForBlog) throw new ForbiddenException();

    await this.sqlCommentLikesRepository.updateLike(
      commentId,
      user.userId,
      newLikeStatus
    );
    return true;
  }
}
