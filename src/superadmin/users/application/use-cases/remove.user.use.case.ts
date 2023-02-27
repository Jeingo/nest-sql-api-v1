import { CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { SqlUsersRepository } from '../../../../users/infrastructure/sql.users.repository';

export class RemoveUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserUseCase {
  constructor(private readonly sqlUsersRepository: SqlUsersRepository) {}

  async execute(command: RemoveUserCommand): Promise<boolean> {
    const result = await this.sqlUsersRepository.delete(command.id);
    if (!result) throw new NotFoundException();
    return true;
  }
}
