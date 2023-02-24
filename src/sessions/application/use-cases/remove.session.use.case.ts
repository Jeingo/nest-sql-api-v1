import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class RemoveSessionCommand {
  constructor(public iat: number) {}
}

@CommandHandler(RemoveSessionCommand)
export class RemoveSessionUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionCommand): Promise<boolean> {
    const iat = command.iat;
    const issueAt = new Date(iat * 1000).toISOString();
    return await this.sessionsRepository.deleteSession(issueAt);
  }
}
