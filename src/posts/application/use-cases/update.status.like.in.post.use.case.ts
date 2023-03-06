import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  LikeStatus,
  SqlDbId
} from '../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../infrastructure/posts-repository.service';
import { PostLikesRepository } from '../../../post-likes/infrastructure/post-likes-repository.service';
import { BlogsUsersBanRepository } from '../../../blogger/users/infrastructure/blogs.users.ban.repository';

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
    private readonly sqlPostsRepository: PostsRepository,
    private readonly sqlPostLikesRepository: PostLikesRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}

  async execute(command: UpdateStatusLikeInPostCommand): Promise<boolean> {
    const postId = command.postId;
    const user = command.user;
    const newLikeStatus = command.newLikeStatus;

    const post = await this.sqlPostsRepository.getById(postId);
    if (!post) throw new NotFoundException();
    const userIsBannedForBlog = await this.blogsUsersBanRepository.isBannedUser(
      post.blogId.toString(),
      user.userId
    );
    if (userIsBannedForBlog) throw new ForbiddenException();

    await this.sqlPostLikesRepository.updateLike(
      postId,
      user.userId,
      newLikeStatus
    );

    return true;
  }
}
