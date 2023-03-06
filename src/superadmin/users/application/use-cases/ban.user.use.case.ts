import { CommandHandler } from '@nestjs/cqrs';
import { InputBanUserDto } from '../../api/dto/input.ban.user.dto';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../../users/infrastructure/users-repository.service';
import { SessionsRepository } from '../../../../sessions/infrastructure/sessions-repository.service';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: string) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly sqlUsersRepository: UsersRepository,
    private readonly sqlSessionRepository: SessionsRepository
  ) {}

  async execute(command: BanUserCommand): Promise<boolean> {
    const { isBanned, banReason } = command.banUserDto;

    const result = await this.sqlUsersRepository.banUser(
      isBanned,
      banReason,
      command.id
    );
    if (!result) throw new NotFoundException();

    await this.sqlSessionRepository.deleteByUserId(command.id);

    return true;
  }
}
