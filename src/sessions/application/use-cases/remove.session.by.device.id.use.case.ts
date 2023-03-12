import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { validate } from 'uuid';

export class RemoveSessionByDeviceIdCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(RemoveSessionByDeviceIdCommand)
export class RemoveSessionByDeviceIdUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionByDeviceIdCommand): Promise<boolean> {
    const deviceId = command.id;
    const userId = command.userId;
    if (!validate(deviceId)) throw new NotFoundException();
    const session = await this.sessionsRepository.getByDeviceId(deviceId);
    if (!session) throw new NotFoundException();
    if (!session.isOwner(userId)) throw new ForbiddenException();
    await this.sessionsRepository.deleteByDeviceId(deviceId);
    return true;
  }
}
