import { CommandHandler } from '@nestjs/cqrs';
import { InputBanUserDto } from '../../api/dto/input.ban.user.dto';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { SessionsRepository } from '../../../../sessions/infrastructure/sessions.repository';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: string) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sessionRepository: SessionsRepository
  ) {}

  async execute(command: BanUserCommand): Promise<boolean> {
    const { isBanned, banReason } = command.banUserDto;

    const result = await this.usersRepository.banUser(
      isBanned,
      banReason,
      command.id
    );
    if (!result) throw new NotFoundException();

    await this.sessionRepository.deleteByUserId(command.id);

    return true;
  }
}
