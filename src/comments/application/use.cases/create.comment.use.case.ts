import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, DbId } from '../../../global-types/global.types';
import { InputCreateCommentDto } from '../../api/dto/input.create.comment.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { Types } from 'mongoose';

export class CreateCommentCommand {
  constructor(
    public createCommentDto: InputCreateCommentDto,
    public postId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: CreateCommentCommand): Promise<DbId> {
    const { content } = command.createCommentDto;
    const { userId, login } = command.user;
    const postId = command.postId;
    const post = await this.postsRepository.getById(postId);
    if (!post) throw new NotFoundException();
    const user = await this.usersRepository.getById(new Types.ObjectId(userId));
    if (user.checkBanStatusForBlog(post.blogId)) {
      throw new ForbiddenException();
    }
    const createdComment = this.commentRepository.create(
      content,
      userId,
      login,
      postId.toString(),
      post.postOwnerInfo.userId
    );
    await this.commentRepository.save(createdComment);
    return createdComment._id;
  }
}
