import { CommandHandler } from '@nestjs/cqrs';
import { InputBanUserDto } from '../../api/dto/input.ban.user.dto';
import { NotFoundException } from '@nestjs/common';
import { SqlUsersRepository } from '../../../../users/infrastructure/sql.users.repository';
import { SqlSessionsRepository } from '../../../../sessions/infrastructure/sql.sessions.repository';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: string) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly sqlUsersRepository: SqlUsersRepository,
    private readonly sqlSessionRepository: SqlSessionsRepository
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
