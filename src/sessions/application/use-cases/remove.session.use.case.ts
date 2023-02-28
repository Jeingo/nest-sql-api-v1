import { CommandHandler } from '@nestjs/cqrs';
import { SqlSessionsRepository } from '../../infrastructure/sql.sessions.repository';

export class RemoveSessionCommand {
  constructor(public iat: number) {}
}

@CommandHandler(RemoveSessionCommand)
export class RemoveSessionUseCase {
  constructor(private readonly sqlSessionsRepository: SqlSessionsRepository) {}

  async execute(command: RemoveSessionCommand): Promise<boolean> {
    return await this.sqlSessionsRepository.deleteSession(command.iat);
  }
}
