import { CommandHandler } from '@nestjs/cqrs';
import { SqlSessionsRepository } from '../../infrastructure/sql.sessions.repository';

export class RemoveSessionWithoutCurrentCommand {
  constructor(public userId: string, public iat: number) {}
}

@CommandHandler(RemoveSessionWithoutCurrentCommand)
export class RemoveSessionWithoutCurrentUseCase {
  constructor(private readonly sqlSessionsRepository: SqlSessionsRepository) {}

  async execute(command: RemoveSessionWithoutCurrentCommand): Promise<boolean> {
    return await this.sqlSessionsRepository.deleteSessionsWithoutCurrent(
      command.userId,
      command.iat
    );
  }
}
