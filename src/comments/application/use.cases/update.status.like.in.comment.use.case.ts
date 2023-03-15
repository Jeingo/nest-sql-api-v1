import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  LikeStatus,
  SqlDbId
} from '../../../global-types/global.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentLikesRepository } from '../../../comment-likes/infrastructure/comment.likes.repository';
import { BlogsUsersBanRepository } from '../../../users-blogs-ban/infrastructure/blogs.users.ban.repository';

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

  async execute(command: UpdateLikeStatusInCommentCommand): Promise<boolean> {
    const user = command.user;
    const commentId = command.commentId;
    const newLikeStatus = command.newLikeStatus;

    const comment = await this.commentsRepository.getById(commentId);

    if (!comment) throw new NotFoundException();

    const blogUserBan = await this.blogsUsersBanRepository.getByPostId(
      comment.postId.toString(),
      user.userId
    );

    if (blogUserBan && blogUserBan.isActive()) throw new ForbiddenException();

    let commentLike = await this.commentLikesRepository.get(
      commentId,
      user.userId
    );

    if (commentLike) {
      commentLike.update(newLikeStatus);
    } else {
      commentLike = this.commentLikesRepository.create(
        commentId,
        user.userId,
        newLikeStatus
      );
    }

    await this.commentLikesRepository.save(commentLike);

    return true;
  }
}
