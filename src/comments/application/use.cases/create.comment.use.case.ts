import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, SqlDbId } from '../../../global-types/global.types';
import { InputCreateCommentDto } from '../../api/dto/input.create.comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlPostsRepository } from '../../../posts/infrastructure/sql.posts.repository';
import { SqlUsersRepository } from '../../../users/infrastructure/sql.users.repository';
import { SqlCommentsRepository } from '../../infrastructure/sql.comments.repository';
import { BlogsUsersBanRepository } from '../../../blogger/users/infrastructure/blogs.users.ban.repository';

export class CreateCommentCommand {
  constructor(
    public createCommentDto: InputCreateCommentDto,
    public postId: SqlDbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase {
  constructor(
    private readonly sqlCommentRepository: SqlCommentsRepository,
    private readonly sqlPostsRepository: SqlPostsRepository,
    private readonly sqlUsersRepository: SqlUsersRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}

  async execute(command: CreateCommentCommand): Promise<SqlDbId> {
    const { content } = command.createCommentDto;
    const { userId } = command.user;
    const postId = command.postId;
    const post = await this.sqlPostsRepository.getById(postId);
    if (!post) throw new NotFoundException();
    const userIsBannedForBlog = await this.blogsUsersBanRepository.isBannedUser(
      post.blogId.toString(),
      userId
    );
    if (userIsBannedForBlog) throw new ForbiddenException();

    const createdComment = await this.sqlCommentRepository.create(
      content,
      userId,
      postId
    );

    return createdComment.id.toString();
  }
}
