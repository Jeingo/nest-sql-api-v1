import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions-repository.service';

export class RemoveSessionCommand {
  constructor(public iat: number) {}
}

@CommandHandler(RemoveSessionCommand)
export class RemoveSessionUseCase {
  constructor(private readonly sqlSessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionCommand): Promise<boolean> {
    return await this.sqlSessionsRepository.deleteSession(command.iat);
  }
}
