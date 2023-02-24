import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, DbId } from '../../../global-types/global.types';
import { InputCreateCommentDto } from '../../api/dto/input.create.comment.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public id: DbId,
    public createCommentDto: InputCreateCommentDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const commentId = command.id;
    const { userId } = command.user;
    const { content } = command.createCommentDto;
    const comment = await this.commentRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();
    comment.update(content);
    await this.commentRepository.save(comment);
    return true;
  }
}
