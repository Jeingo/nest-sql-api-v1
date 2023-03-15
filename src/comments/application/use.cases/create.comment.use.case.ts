import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, SqlDbId } from '../../../global-types/global.types';
import { InputCreateCommentDto } from '../../api/dto/input.create.comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { BlogsUsersBanRepository } from '../../../users-blogs-ban/infrastructure/blogs.users.ban.repository';

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
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly blogsUsersBanRepository: BlogsUsersBanRepository
  ) {}

  async execute(command: CreateCommentCommand): Promise<SqlDbId> {
    const { content } = command.createCommentDto;
    const { userId } = command.user;
    const postId = command.postId;

    const post = await this.postsRepository.getById(postId);

    if (!post) throw new NotFoundException();

    const blogUserBan = await this.blogsUsersBanRepository.getByBlogId(
      post.blogId.toString(),
      userId
    );

    if (blogUserBan && blogUserBan.isActive()) throw new ForbiddenException();

    const comment = this.commentsRepository.create(content, userId, postId);

    await this.commentsRepository.save(comment);

    return comment.id.toString();
  }
}
