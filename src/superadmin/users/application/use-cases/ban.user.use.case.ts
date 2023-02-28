import { CommandHandler } from '@nestjs/cqrs';
import { InputBanUserDto } from '../../api/dto/input.ban.user.dto';
import { NotFoundException } from '@nestjs/common';
import { SqlUsersRepository } from '../../../../users/infrastructure/sql.users.repository';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: string) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly sqlUsersRepository: SqlUsersRepository // private readonly usersRepository: UsersRepository, // private readonly postsRepository: PostsRepository, // private readonly blogsRepository: BlogsRepository, // private readonly commentsRepository: CommentsRepository
  ) {}

  async execute(command: BanUserCommand): Promise<boolean> {
    const { isBanned, banReason } = command.banUserDto;

    const result = await this.sqlUsersRepository.banUser(
      isBanned,
      banReason,
      command.id
    );
    if (!result) throw new NotFoundException();

    // await this.sessionsRepository.deleteByUserId(userId.toString());

    return true;
  }
  //todo add flow with other entity
  //
  // private async changeCountCommentLikes(
  //   commentLikes: CommentLikeDocument[],
  //   isBanned: boolean
  // ) {
  //   for (let i = 0; i < commentLikes.length; i++) {
  //     const comment = await this.commentsRepository.getById(
  //       new Types.ObjectId(commentLikes[i].commentId)
  //     );
  //     const statusLike = commentLikes[i].myStatus;
  //     comment.changeLikesCount(statusLike, isBanned);
  //     await this.commentsRepository.save(comment);
  //   }
  // }
  // private async changeCountPostLikes(
  //   postLikes: PostLikeDocument[],
  //   isBanned: boolean
  // ) {
  //   for (let i = 0; i < postLikes.length; i++) {
  //     const post = await this.postsRepository.getById(
  //       new Types.ObjectId(postLikes[i].postId)
  //     );
  //     const statusLike = postLikes[i].myStatus;
  //     post.changeLikesCount(statusLike, isBanned);
  //     await this.postsRepository.save(post);
  //   }
  // }
}
