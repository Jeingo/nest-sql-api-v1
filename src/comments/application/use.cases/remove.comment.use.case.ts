import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, SqlDbId } from '../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlCommentsRepository } from '../../infrastructure/sql.comments.repository';

export class RemoveCommentCommand {
  constructor(public id: SqlDbId, public user: CurrentUserType) {}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentUseCase {
  constructor(private readonly sqlCommentRepository: SqlCommentsRepository) {}

  async execute(command: RemoveCommentCommand): Promise<boolean> {
    const commentId = command.id;
    const { userId } = command.user;
    const comment = await this.sqlCommentRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    if (comment.userId.toString() !== userId) throw new ForbiddenException();
    await this.sqlCommentRepository.delete(commentId);
    return true;
  }
}
