import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../../global-types/global.types';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { InputBanUserDto } from '../../api/dto/input.ban.user.dto';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { CommentsRepository } from '../../../../comments/infrastructure/comments.repository';
import { CommentLikesRepository } from '../../../../comment-likes/infrastructure/comment.likes.repository';
import { PostLikesRepository } from '../../../../post-likes/infrastructure/post.likes.repository';
import { SessionsRepository } from '../../../../sessions/infrastructure/sessions.repository';
import { NotFoundException } from '@nestjs/common';
import { CommentLikeDocument } from '../../../../comment-likes/domain/entities/comment.like.entity';
import { PostLikeDocument } from '../../../../post-likes/domain/entities/post.like.entity';
import { Types } from 'mongoose';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: DbId) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly postLikesRepository: PostLikesRepository,
    private readonly sessionsRepository: SessionsRepository
  ) {}

  async execute(command: BanUserCommand): Promise<boolean> {
    const { isBanned, banReason } = command.banUserDto;
    const userId = command.id;

    const user = await this.usersRepository.getById(userId);
    if (!user) throw new NotFoundException();

    const blogs = await this.blogsRepository.getByUserId(userId.toString());
    const posts = await this.postsRepository.getByUserId(userId.toString());
    const comments = await this.commentsRepository.getByUserId(
      userId.toString()
    );
    const commentLikes = await this.commentLikesRepository.getByUserId(
      userId.toString()
    );
    const postLikes = await this.postLikesRepository.getByUserId(
      userId.toString()
    );

    user.ban(isBanned, banReason);
    blogs.map((doc) => doc.ban(isBanned));
    commentLikes.map((doc) => doc.ban(isBanned));
    postLikes.map((doc) => doc.ban(isBanned));
    posts.map((doc) => doc.ban(isBanned));
    comments.map((doc) => doc.ban(isBanned));

    await this.changeCountCommentLikes(commentLikes, isBanned);
    await this.changeCountPostLikes(postLikes, isBanned);

    await this.usersRepository.save(user);
    blogs.map(async (doc) => await this.blogsRepository.save(doc));
    posts.map(async (doc) => await this.postsRepository.save(doc));
    comments.map(async (doc) => await this.commentsRepository.save(doc));
    commentLikes.map(
      async (doc) => await this.commentLikesRepository.save(doc)
    );
    postLikes.map(async (doc) => await this.postLikesRepository.save(doc));

    await this.sessionsRepository.deleteByUserId(userId.toString());

    return true;
  }

  private async changeCountCommentLikes(
    commentLikes: CommentLikeDocument[],
    isBanned: boolean
  ) {
    for (let i = 0; i < commentLikes.length; i++) {
      const comment = await this.commentsRepository.getById(
        new Types.ObjectId(commentLikes[i].commentId)
      );
      const statusLike = commentLikes[i].myStatus;
      comment.changeLikesCount(statusLike, isBanned);
      await this.commentsRepository.save(comment);
    }
  }
  private async changeCountPostLikes(
    postLikes: PostLikeDocument[],
    isBanned: boolean
  ) {
    for (let i = 0; i < postLikes.length; i++) {
      const post = await this.postsRepository.getById(
        new Types.ObjectId(postLikes[i].postId)
      );
      const statusLike = postLikes[i].myStatus;
      post.changeLikesCount(statusLike, isBanned);
      await this.postsRepository.save(post);
    }
  }
}
