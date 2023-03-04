import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  LikeStatus,
  SqlDbId
} from '../../../global-types/global.types';
import { NotFoundException } from '@nestjs/common';
import { SqlPostsRepository } from '../../infrastructure/sql.posts.repository';
import { SqlPostLikesRepository } from '../../../post-likes/infrastructure/sql.post.likes.repository';

export class UpdateStatusLikeInPostCommand {
  constructor(
    public user: CurrentUserType,
    public postId: SqlDbId,
    public newLikeStatus: LikeStatus
  ) {}
}

@CommandHandler(UpdateStatusLikeInPostCommand)
export class UpdateStatusLikeInPostUseCase {
  constructor(
    private readonly sqlPostsRepository: SqlPostsRepository,
    private readonly sqlPostLikesRepository: SqlPostLikesRepository
  ) {}

  async execute(command: UpdateStatusLikeInPostCommand): Promise<boolean> {
    const postId = command.postId;
    const user = command.user;
    const newLikeStatus = command.newLikeStatus;

    const post = await this.sqlPostsRepository.getById(postId);
    if (!post) throw new NotFoundException();

    await this.sqlPostLikesRepository.updateLike(
      postId,
      user.userId,
      newLikeStatus
    );

    return true;
  }
}
