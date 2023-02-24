import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class RemoveSessionWithoutCurrentCommand {
  constructor(public userId: string, public iat: number) {}
}

@CommandHandler(RemoveSessionWithoutCurrentCommand)
export class RemoveSessionWithoutCurrentUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionWithoutCurrentCommand): Promise<boolean> {
    const iat = command.iat;
    const userId = command.userId;
    const issueAt = new Date(iat * 1000).toISOString();
    return await this.sessionsRepository.deleteSessionsWithoutCurrent(
      userId,
      issueAt
    );
  }
}
