import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, SqlDbId } from '../../../global-types/global.types';
import { InputCreateCommentDto } from '../../api/dto/input.create.comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlCommentsRepository } from '../../infrastructure/sql.comments.repository';

export class UpdateCommentCommand {
  constructor(
    public id: SqlDbId,
    public createCommentDto: InputCreateCommentDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase {
  constructor(private readonly sqlCommentRepository: SqlCommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const commentId = command.id;
    const { userId } = command.user;
    const { content } = command.createCommentDto;
    const comment = await this.sqlCommentRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    if (comment.userId.toString() !== userId) throw new ForbiddenException();
    await this.sqlCommentRepository.update(commentId, content);
    return true;
  }
}
