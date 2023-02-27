import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SqlSessionsRepository } from '../../infrastructure/sql.sessions.repository';
import { validate } from 'uuid';

export class RemoveSessionByDeviceIdCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(RemoveSessionByDeviceIdCommand)
export class RemoveSessionByDeviceIdUseCase {
  constructor(private readonly sqlSessionsRepository: SqlSessionsRepository) {}

  async execute(command: RemoveSessionByDeviceIdCommand): Promise<boolean> {
    const sessionId = command.id;
    const userId = command.userId;
    if (!validate(sessionId)) throw new NotFoundException();
    const session = await this.sqlSessionsRepository.get(sessionId);
    if (!session) throw new NotFoundException();
    if (session.userId.toString() !== userId) throw new ForbiddenException();
    return await this.sqlSessionsRepository.deleteSessionByDeviceId(sessionId);
  }
}
