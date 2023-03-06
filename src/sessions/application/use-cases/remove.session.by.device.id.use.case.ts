import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsRepository } from '../../infrastructure/sessions-repository.service';
import { validate } from 'uuid';

export class RemoveSessionByDeviceIdCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(RemoveSessionByDeviceIdCommand)
export class RemoveSessionByDeviceIdUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionByDeviceIdCommand): Promise<boolean> {
    const sessionId = command.id;
    const userId = command.userId;
    if (!validate(sessionId)) throw new NotFoundException();
    const session = await this.sessionsRepository.get(sessionId);
    if (!session) throw new NotFoundException();
    if (session.userId.toString() !== userId) throw new ForbiddenException();
    return await this.sessionsRepository.deleteSessionByDeviceId(sessionId);
  }
}
