import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class RemoveSessionCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(RemoveSessionCommand)
export class RemoveSessionUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionCommand): Promise<boolean> {
    await this.sessionsRepository.deleteByDeviceId(command.deviceId);
    return true;
  }
}
