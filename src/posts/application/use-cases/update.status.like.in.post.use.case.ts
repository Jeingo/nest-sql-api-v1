import { CommandHandler } from '@nestjs/cqrs';
import { DbId, LikeStatus } from '../../../global-types/global.types';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostLikesRepository } from '../../../post-likes/infrastructure/post.likes.repository';

export class UpdateStatusLikeInPostCommand {
  constructor(
    public userId: string,
    public postId: DbId,
    public login: string,
    public newLikeStatus: LikeStatus
  ) {}
}

@CommandHandler(UpdateStatusLikeInPostCommand)
export class UpdateStatusLikeInPostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postLikesRepository: PostLikesRepository
  ) {}

  async execute(command: UpdateStatusLikeInPostCommand): Promise<boolean> {
    const postId = command.postId;
    const userId = command.userId;
    const login = command.login;
    const newLikeStatus = command.newLikeStatus;

    let lastLikeStatus: LikeStatus = LikeStatus.None;

    const post = await this.postsRepository.getById(postId);
    if (!post) throw new NotFoundException();
    let like = await this.postLikesRepository.getByUserIdAndPostId(
      userId,
      postId.toString()
    );
    if (!like) {
      like = this.postLikesRepository.create(
        userId,
        postId.toString(),
        newLikeStatus,
        login
      );
    } else {
      lastLikeStatus = like.myStatus;
      like.update(newLikeStatus);
    }
    post.updateLike(lastLikeStatus, newLikeStatus);

    await this.postLikesRepository.save(like);
    await this.postsRepository.save(post);
    return true;
  }
}
