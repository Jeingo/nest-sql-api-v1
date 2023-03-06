import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions-repository.service';

export class RemoveSessionCommand {
  constructor(public iat: number) {}
}

@CommandHandler(RemoveSessionCommand)
export class RemoveSessionUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionCommand): Promise<boolean> {
    return await this.sessionsRepository.deleteSession(command.iat);
  }
}
