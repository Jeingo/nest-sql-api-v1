import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../../global-types/global.types';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { NotFoundException } from '@nestjs/common';

export class RemoveUserCommand {
  constructor(public id: DbId) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: RemoveUserCommand): Promise<boolean> {
    const user = await this.usersRepository.getById(command.id);
    if (!user) throw new NotFoundException();
    await this.usersRepository.delete(command.id);
    return true;
  }
}
