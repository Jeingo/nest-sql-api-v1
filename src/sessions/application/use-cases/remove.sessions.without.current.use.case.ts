import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class RemoveSessionWithoutCurrentCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(RemoveSessionWithoutCurrentCommand)
export class RemoveSessionWithoutCurrentUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionWithoutCurrentCommand): Promise<boolean> {
    await this.sessionsRepository.deleteWithoutCurrent(
      command.userId,
      command.deviceId
    );
    return true;
  }
}
