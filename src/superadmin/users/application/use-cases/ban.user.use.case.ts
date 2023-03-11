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
    const user = await this.usersRepository.getById(command.id);
    if (!user) throw new NotFoundException();
    user.ban(isBanned, banReason);
    await this.usersRepository.save(user);
    await this.sessionRepository.deleteByUserId(command.id);
    return true;
  }
}
