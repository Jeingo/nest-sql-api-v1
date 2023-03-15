import { CommandHandler } from '@nestjs/cqrs';
import {
  CurrentUserType,
  LikeStatus,
  SqlDbId
} from '../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostLikesRepository } from '../../../post-likes/infrastructure/post.likes.repository';
import { BlogsUsersBanRepository } from '../../../users-blogs-ban/infrastructure/blogs.users.ban.repository';

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
    private readonly postsRepository: PostsRepository,
    private readonly postLikesRepository: PostLikesRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}

  async execute(command: UpdateStatusLikeInPostCommand): Promise<boolean> {
    const postId = command.postId;
    const user = command.user;
    const newLikeStatus = command.newLikeStatus;

    const post = await this.postsRepository.getById(postId);
    if (!post) throw new NotFoundException();

    const blogUserBan = await this.blogsUsersBanRepository.getByBlogId(
      post.blogId.toString(),
      user.userId
    );

    if (blogUserBan && blogUserBan.isActive()) throw new ForbiddenException();

    let postLike = await this.postLikesRepository.get(postId, user.userId);

    if (postLike) {
      postLike.update(newLikeStatus);
    } else {
      postLike = this.postLikesRepository.create(
        postId,
        user.userId,
        newLikeStatus
      );
    }

    await this.postLikesRepository.save(postLike);

    return true;
  }
}
