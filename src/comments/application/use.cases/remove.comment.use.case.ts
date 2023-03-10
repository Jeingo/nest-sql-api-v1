import { CommandHandler } from '@nestjs/cqrs';
import { CurrentUserType, SqlDbId } from '../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class RemoveCommentCommand {
  constructor(public id: SqlDbId, public user: CurrentUserType) {}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentUseCase {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: RemoveCommentCommand): Promise<boolean> {
    const commentId = command.id;
    const { userId } = command.user;
    const comment = await this.commentsRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    if (comment.userId.toString() !== userId) throw new ForbiddenException();
    await this.commentsRepository.delete(commentId);
    return true;
  }
}
