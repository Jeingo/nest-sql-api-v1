import { CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../../users/infrastructure/users-repository.service';

export class RemoveUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserUseCase {
  constructor(private readonly sqlUsersRepository: UsersRepository) {}

  async execute(command: RemoveUserCommand): Promise<boolean> {
    const result = await this.sqlUsersRepository.delete(command.id);
    if (!result) throw new NotFoundException();
    return true;
  }
}
